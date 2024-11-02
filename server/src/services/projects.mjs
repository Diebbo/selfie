export default function createProjectService(models, lib) {
  const { projectModel, userModel } = models;

  async function populateMembers(project) {
    await project.populate('members');
    await project.populate('activities.assignees');
    let populatedProject = project.toObject();

    populatedProject.creator = populatedProject.members.find(m => m._id.equals(populatedProject.creator)).username;

    function mapAssignees(assignees, members) {
      return assignees?.map(assignee => members.find(m => m._id.equals(assignee._id)).username);
    }

    function mapComments(comments, members) {
      return comments?.map(comment => {
        comment.creator = members.find(m => m._id.equals(comment.creator)).username;
        return comment;
      });
    }

    function mapSubActivities(subActivities, members) {
      return subActivities?.map(subActivity => {
        subActivity.assignees = mapAssignees(subActivity.assignees, members);
        subActivity.comments = mapComments(subActivity.comments, members);
        return subActivity;
      });
    }

    populatedProject.activities = populatedProject.activities.map(activity => {
      activity.assignees = mapAssignees(activity.assignees, project.members);
      activity.comments = mapComments(activity.comments, project.members);
      activity.subActivities = mapSubActivities(activity.subActivities, project.members);
      return activity;
    });
    populatedProject.members = populatedProject.members.map(m => m.username);

    return populatedProject;
  }

  async function populateDbMembers(project) {
    const members = await models.userModel.find({ username: { $in: project.members } });
    project.members = members.map(m => m._id);
    project.creator = members.find(m => m.username === project.creator)._id;

    function mapAssigneesToIds(assignees, members) {
      return assignees?.map(assigneeUsername => {
        const member = members.find(m => m.username === assigneeUsername);
        if (!member) throw new Error(`Member ${assigneeUsername} not found for assignee`);
        return member._id;
      });
    }

    function mapCommentsToIds(comments, members) {
      comments?.forEach(comment => {
        comment.creator = members.find(m => m.username === comment.creator)._id;
        if (!comment.creator) throw new Error(`Member ${comment.creator} not found for comment creator`);
      });
    }

    function mapSubActivitiesToIds(subActivities, members) {
      subActivities?.forEach(subActivity => {
        subActivity.assignees = mapAssigneesToIds(subActivity.assignees, members);
        mapCommentsToIds(subActivity.comments, members);
      });
    }

    project.activities?.forEach(activity => {
      activity.assignees = mapAssigneesToIds(activity.assignees, members);
      mapCommentsToIds(activity.comments, members);
      mapSubActivitiesToIds(activity.subActivities, members);
    });

    return project;
  }

  const STATUS_TRANSITIONS = {
    'pending': 'in-progress',
    'in-progress': 'completed',
    'completed': 'pending'
  };

  /**
   * Updates the status of an activity following a cyclic transition
   * @param {Array} activities - Array of activities to search through
   * @param {ObjectId} activityId - ID of the activity to update
   * @returns {boolean} - Whether the activity was found and updated
   */
  const toggleActivityStatus = (activities, activityId) => {
    if (!activities || !Array.isArray(activities)) return false;

    const activity = activities.find(a => a._id.equals(activityId));
    if (!activity) return false;

    activity.status = STATUS_TRANSITIONS[activity.status];
    return true;
  };


  return {
    async updateProject(uid, projectId, project) {
      const dbProj = await projectModel.findOne({ _id: projectId, creator: uid });
      if (!dbProj) throw new Error("Progetto non trovato");
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      // Validate activities
      for (const activity of (project.activities || [])) {
        lib.checkActivityFit(project, activity);
      }

      // Populate members
      project.members = project.members || [];
      if (!project.members.includes(user.username)) {
        project.members.push(user.username);
      }
      project = await populateDbMembers(project);

      let result = await projectModel.findOneAndUpdate(
        { _id: projectId, creator: uid },
        project,
        { new: true }
      );
      if (!result) throw new Error("Errore nell'aggiornamento del progetto");

      result = await populateMembers(result);
      return result;
    },
    async delete(uid, projectId) {
      const result = await projectModel.deleteOne({ _id: projectId, creator: uid });
      if (result.deletedCount === 0) throw new Error("Errore nell'eliminazione del progetto");
      return { success: true };
    },

    async getProject(uid, projectId) {
      let project = await projectModel.findById(projectId);
      if (!project) throw new Error("Progetto non trovato");
      project = await populateMembers(project);
      return project;
    },

    async getProjects(uid) {
      let projects = await projectModel.find({ $or: [{ creator: uid }, { members: uid }] });
      if (!projects || projects.length === 0) return [];

      for (let i = 0; i < projects.length; i++) {
        projects[i] = await populateMembers(projects[i]);
      }

      return projects;
    },

    async createProject(uid, project, activities = null) {
      // Verify the creating user exists
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      // Validate project object
      if (!project.title || !project.description || !project.startDate || !project.deadline) {
        throw new Error("Project must have a title, description, start date, and deadline");
      }

      if (new Date(project.startDate) >= new Date(project.deadline)) {
        throw new Error("Project start date must be before the deadline");
      }

      // Initialize and validate members array
      project.members = Array.isArray(project.members) ? project.members : [];
      if (!project.members.includes(user.username)) {
        project.members.push(user.username);
      }

      // Verify all members exist in the database before proceeding
      const members = await userModel.find({ username: { $in: project.members } });
      if (members.length !== project.members.length) {
        const foundUsernames = members.map(m => m.username);
        const missingMembers = project.members.filter(username => !foundUsernames.includes(username));
        throw new Error(`Some members were not found: ${missingMembers.join(', ')}`);
      }

      // Map usernames to IDs for the database
      const memberIds = members.map(member => member._id);

      // Process activities if they exist
      let processedActivities = [];
      if (activities && Array.isArray(activities) && activities.length > 0) {
        activities.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const errors = [];
        for (let activity of activities) {
          try {
            // Verify and map assignees to their IDs
            if (activity.assignees && Array.isArray(activity.assignees)) {
              const assigneeMembers = members.filter(m =>
                activity.assignees.includes(m.username)
              );
              activity.assignees = assigneeMembers.map(m => m._id);
            }

            // Process any sub-activities
            if (activity.subActivities && Array.isArray(activity.subActivities)) {
              activity.subActivities = activity.subActivities.map(sub => {
                if (sub.assignees && Array.isArray(sub.assignees)) {
                  const subAssigneeMembers = members.filter(m =>
                    sub.assignees.includes(m.username)
                  );
                  sub.assignees = subAssigneeMembers.map(m => m._id);
                }
                return sub;
              });
            }

            // Validate activity fits within project timeline
            const validatedActivity = await lib.addActivityToProject(project, activity);
            processedActivities.push(validatedActivity);
          } catch (e) {
            errors.push(e.message);
          }
        }

        if (errors.length > 0) {
          throw new Error("Invalid activities: " + errors.join(", "));
        }
      }

      // Get current timestamp
      const now = await lib.getDateTime();

      // Create the project with proper ID references
      const projectData = {
        ...project,
        creator: uid,
        members: memberIds,
        activities: processedActivities,
        creationDate: now
      };

      // Save the new project
      let newProject = await projectModel.create(projectData);
      if (!newProject) {
        throw new Error("Failed to create project");
      }

      // Update all member users with the new project reference
      await userModel.updateMany(
        { _id: { $in: memberIds } },
        { $addToSet: { projects: newProject._id } }
      );

      // Populate and return the complete project
      newProject = await projectModel.findById(newProject._id);
      if (!newProject) {
        throw new Error("Failed to retrieve created project");
      }

      const populatedProject = await populateMembers(newProject);
      return populatedProject;
    },
    /**
     * Toggles an activity's status within a project, searching both top-level activities
     * and sub-activities
     * @param {string} uid - User ID
     * @param {string} projectId - Project ID
     * @param {string} activityId - Activity ID to toggle
     * @returns {Promise<Project>} - Updated project
     */
    async toggleActivityStatusInProject(uid, projectId, activityId) {
      const project = await projectModel.findOne({
        _id: projectId,
        creator: uid
      });

      if (!project) {
        throw new Error("Project not found");
      }

      // Try to update top-level activities
      let found = toggleActivityStatus(project.activities, activityId);

      // If not found in top-level, search through sub-activities
      if (!found) {
        for (const activity of project.activities) {
          if (toggleActivityStatus(activity.subActivities, activityId)) {
            found = true;
            break;
          }
        }
      }

      if (!found) {
        throw new Error("Activity not found in project");
      }

      // Save and return the updated project
      await project.save();

      return populateMembers(project);
    }
  };
}

