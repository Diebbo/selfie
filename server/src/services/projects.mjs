export default function createProjectService(models, lib) {
  const { projectModel, userModel } = models;

  async function populateMembers(project) {
    await project.populate('members');
    await project.populate('activities.assignees');
    let populatedProject = project.toObject();

    populatedProject.creator = populatedProject.members.find(m => m._id.equals(populatedProject.creator)).username;

    function mapAssignees(assignees, members) {
      return assignees.map(assignee => members.find(m => m._id.equals(assignee._id)).username);
    }

    function mapComments(comments, members) {
      return comments.map(comment => {
        comment.creator = members.find(m => m._id.equals(comment.creator)).username;
        return comment;
      });
    }

    function mapSubActivities(subActivities, members) {
      return subActivities.map(subActivity => {
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

    function mapAssigneesToIds(assignees, members) {
      return assignees.map(assigneeUsername => {
        const member = members.find(m => m.username === assigneeUsername);
        if (!member) throw new Error(`Member ${assigneeUsername} not found for assignee`);
        return member._id;
      });
    }

    function mapCommentsToIds(comments, members) {
      comments.forEach(comment => {
        comment.creator = members.find(m => m.username === comment.creator)._id;
        if (!comment.creator) throw new Error(`Member ${comment.creator} not found for comment creator`);
      });
    }

    function mapSubActivitiesToIds(subActivities, members) {
      subActivities.forEach(subActivity => {
        subActivity.assignees = mapAssigneesToIds(subActivity.assignees, members);
        mapCommentsToIds(subActivity.comments, members);
      });
    }

    project.activities.forEach(activity => {
      activity.assignees = mapAssigneesToIds(activity.assignees, members);
      mapCommentsToIds(activity.comments, members);
      mapSubActivitiesToIds(activity.subActivities, members);
    });

    return project;
  }

  return {
    async updateProject(uid, projectId, project) {
      const dbProj = await projectModel.findOne({ _id: projectId, creator: uid });
      if (!dbProj) throw new Error("Progetto non trovato");
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      // Validate activities
      for (const activity of project.activities) {
        lib.checkActivityFit(project, activity);
      }

      // Populate members
      project.members = project.members || [];
      project.members.push(user.username);
      await populateDbMembers(project);

      let result = await projectModel.findOneAndUpdate({ _id: projectId, creator: uid }, project, { new: true });
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
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      // Validate project object
      if (!project.title || !project.description || !project.startDate || !project.deadline) {
        throw new Error("Project must have a title, description, start date, and deadline");
      }

      if (new Date(project.startDate) >= new Date(project.deadline)) {
        throw new Error("Project start date must be before the deadline");
      }

      project.members = project.members || [];
      project.members.push(user.username);

      // Add activities to the project
      let errors = [];
      if (activities && activities.length > 0) {
        activities.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        for (let activity of activities) {
          try {
            project = await lib.addActivityToProject(project, activity);
          } catch (e) {
            errors.push(e.message);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error("Invalid activities: " + errors.join(", "));
      }

      // Populate members
      project = await populateDbMembers(project);

      // Add today's date to the project
      const now = await lib.getDateTime();
      const newProject = await projectModel.create({
        ...project,
        creator: uid,
        creationDate: now,
      });

      // Save the project
      const addedProject = await newProject.save();
      if (!addedProject) throw new Error("Project not created");

      // Add project to the user's projects
      if (!user.projects) user.projects = [];
      user.projects.push(addedProject._id);
      await user.save();

      // Add all the members to the project
      const members = await userModel.find({ username: { $in: project.members } });
      for (let member of members) {
        if (!member.projects) member.projects = [];
        member.projects.push(addedProject._id);
        await member.save();
      }

      return addedProject;
    },

    async toggleActivityStatus(uid, projectId, activityId) {
      const project = await projectModel.findOne({ _id: projectId, creator: uid });
      if (!project) throw new Error("Progetto non trovato");

      const activity = project.activities.id(activityId);

      if (activity) {
        activity.status = activity.status === 'completed' ? 'in-progress' : 'completed';
      }
      await project.save();

      return await populateMembers(project);
    }
  }
}
