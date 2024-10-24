class ProjectCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'project-card');
    this.user = null;
    this.project = null;

    const style = document.createElement('style');
    style.textContent = `
  :host {
    --bg-color: #f5f5f5;
    --text-color: #333;
    --gantt-bg-color: white;
    --cell-bg-color: #e0e0e0;
    --hover-bg-color: #F0F8FF;
    --pending-color: silver;
    --partial-completed-color: #F4A460;
    --title-color: #333;
    --success-color: #4CAF50;
  }

  :host([dark-mode]) {
    --bg-color: #333;
    --text-color: #f5f5f5;
    --gantt-bg-color: #444;
    --cell-bg-color: #666;
    --hover-bg-color: #555;
  }

  .project-card {
    font-family: Arial, sans-serif;
    padding: 20px;
    background-color: var(--bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2, h3{
    margin-top: 0;
    color: var(--text-color);
  }
  
  .gantt-chart {
    overflow-x: auto;
    margin-top: 20px;
    background-color: var(--gantt-bg-color);
    border-radius: 4px;
    padding: 10px;
  }
  
  .gantt-cell {
    flex: 1;
    min-width: 40px;
    height: 30px;
    border-right: 1px solid var(--cell-bg-color);
    text-align: center;
    font-size: 12px;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gantt-task-cell:hover {
    background-color: var(--hover-bg-color) !important;
  }
      .title {
        color: var(--title-color);
      }

      .gantt-chart {
        overflow-x: auto;
        margin-top: 20px;
        background-color: white;
        border-radius: 4px;
        padding: 10px;
      }
      .gantt-header, .gantt-row {
        display: flex;
        align-items: space-between;
      }
      .gantt-header {
        font-weight: bold;
      }
      
      .gantt-cell:last-child {
        border-right: none;
      }
      .gantt-task {
        background-color: #4CAF50;
        height: 20px;
        border-radius: 3px;
      }
      .gantt-task-cell.completed {
        background-color: #4CAF50;  /* Full green for completed */
      }
      
      .gantt-task-cell.partial-completed {
        background-color: var(--partial-completed-color); 
      }
      
      .gantt-task-cell.pending {
        background-color: var(--pending-color);  
      }
      .gantt-task-cell.passed {
        background-color: #FFC107;  /* Yellow for passed due date */
      }
      
      .gantt-task-cell.child-completed {
        background-color: #81C784;  /* Different green for completed child tasks */
      }
      .task-info {
        min-width: 200px;
        max-width: 200px;
        padding-right: 10px;
        justify-content: flex-start;
      }
      .task-info:hover {
        cursor: pointer;
        color: #2196F3;
      }
      .subactivity {
        margin-left: 20px;
      }
      .days-column{
        min-width: 50px;
        max-width: 50px;
      }
      .start-date-column, .end-date-column {
        min-width: 80px;
        max-width: 80px;
      }
      .participants-column {
        min-width: 150px;
        max-width: 150px;
        overflow: hidden;
      }
      .success {
        background-color: #4CAF50;
      }
      .add-activity-btn {
        background-color: #4CAF50;
        color: white;
        padding: 10px 15px;
        border: none;
        cursor: pointer;
        margin-top: 10px;
      }
      .add-activity-btn {
        background-color: var(--success-color);
        border-radius: 4px;
      }
      .parent-activity-select {
        width: 100%;
        padding: 8px;
        margin: 8px 0;
        box-sizing: border-box;
      }
      .delete {
        background-color: #f44336;
        color: white;
        padding: 5px 10px;
        border: none;
        cursor: pointer;
        border-radius: 4px;
        float: right;
      }
      #activityForm input, #activityForm textarea {
        width: 100%;
        padding: 8px;
        margin: 8px 0;
        box-sizing: border-box;
      }
      #activityForm button {
        color: white;
        padding: 10px 15px;
        border: none;
        cursor: pointer;
        margin-top: 10px;
        border-radius: 4px;
      }

    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);

    this._modal = null;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const wrapper = this.shadowRoot.querySelector('.project-card');
    this.project = JSON.parse(this.getAttribute('project'));
    this.user = JSON.parse(this.getAttribute('user'));

    if (wrapper && this.project) {
      const startDate = new Date(this.project.startDate);
      const endDate = new Date(this.project.deadline);
      const days = this.getDaysBetween(startDate, endDate);

      wrapper.innerHTML = `
        <h2 class=".title">${this.project.title}<button class="delete" id="delete-proj">delete</button></h2>
        <h3 class=".title">${this.project.description}</h3>
        <button class="add-activity-btn">Add Activity</button>
        <div class="gantt-chart">
          ${this.renderGanttChart(this.project.activities, days, startDate)}
        </div>
        <modal-component id="activityModal">
          <form id="activityForm">
            <input type="text" id="activityName" placeholder="Activity Name" required>
            <input type="date" id="activityStartDate" placeholder="Start Date" required>
            <input type="date" id="activityDueDate" placeholder="Due Date" required>
            <input type="text" id="activityParticipants" placeholder="Participants (comma-separated)">
            <textarea id="activityDescription" placeholder="Description"></textarea>
            <select id="parentActivitySelect" class="parent-activity-select">
              <option value="">No Parent (Top-level Activity)</option>
            </select>
            <button type="submit" class="success">Save Changes</button>
            <button type="button" class="delete" id="delete-activity">Delete Activity</button>
          </form>
        </modal-component>
      `;

      this._modal = this.shadowRoot.querySelector('modal-component');

      // Event listeners per apertura modale
      this.addEventListeners(this.project);
    }
  }

  toggleActivityCompletion(activityId, project) {
    fetch(`/api/projects/${project._id}/activities/${activityId}/togglecompleted`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error('Error updating activity');
    }).then((data) => {
      this.modifyProject(data.project);
      console.log(data.message);
    }).catch((error) => {
      console.error(error);
    });
  }


  addEventListeners(project) {
    this._modal = this.shadowRoot.querySelector('modal-component');
    const form = this.shadowRoot.querySelector('#activityForm');
    const addActivityBtn = this.shadowRoot.querySelector('.add-activity-btn');
    const deleteProjectBtn = this.shadowRoot.querySelector("#delete-proj");
    const deleteActivityBtn = form.querySelector('#delete-activity');

// Event delegation for task name and completion toggle
  const ganttChart = this.shadowRoot.querySelector('.gantt-chart');
  ganttChart.addEventListener('click', (event) => {
    const taskNameCell = event.target.closest('.task-name');
    const taskCell = event.target.closest('.gantt-task-cell');
    
    if (taskNameCell) {
      const taskId = taskNameCell.getAttribute('data-activity-id');
      if (taskId) {
        this.openModal(taskId, project, false);
      }
    } else if (taskCell) {
      const row = taskCell.closest('.gantt-row');
      if (row) {
        const taskNameCell = row.querySelector('.task-name');
        const taskId = taskNameCell?.getAttribute('data-activity-id');
        if (taskId) {
          this.toggleActivityCompletion(taskId, project);
        }
      }
    }
  });

    addActivityBtn.addEventListener('click', () => {
      this.openModal(null, project, true);
    });

    deleteProjectBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete the project "${project.title}"?`)) {
        const deleteEvent = new CustomEvent('delete-project', {
          bubbles: true,
          composed: true,
          detail: { projectId: project._id }
        });
        this.dispatchEvent(deleteEvent);
      }
    });


    deleteActivityBtn.addEventListener('click', (event) => {
      try {
        const activityId = JSON.parse(form.dataset.activity)._id;
        this.deleteActivity(project, activityId);
      } catch (error) {
        this._modal.closeModal();
      }
    });


    form.addEventListener('submit', (e) => this.handleFormSubmit(e, project));
  }

  addError(message) {
    this._modal.setError(message);
  }

  modifyProject(project) {
    const updateEvent = new CustomEvent('update-project', {
      bubbles: true,
      composed: true,
      detail: { project: project }
    });
    this.dispatchEvent(updateEvent);
    this.setAttribute('project', JSON.stringify(project));
    this.render();
  }

  removeActivityFromProject(project, activityId) {
    const removeFromArray = (activities) => {
      const index = activities.findIndex(a => a._id === activityId);
      if (index !== -1) {
        return activities.splice(index, 1)[0];
      }

      for (let activity of activities) {
        if (activity.subActivities) {
          const removed = removeFromArray(activity.subActivities);
          if (removed) return removed;
        }
      }
      return null;
    };

    const removedActivity = removeFromArray(project.activities);
    if (removedActivity) {
      return removedActivity;
    }
    return null;
  }

  updateActivityInProject(project, updatedActivity, parentActivityId) {
    // First remove the activity from its current location
    this.removeActivityFromProject(project, updatedActivity._id);

    // Then add it to the new location
    if (!parentActivityId) {
      // If no parent ID, add to root level
      project.activities.push(updatedActivity);
    } else {
      const findAndAddToParent = (activities) => {
        for (let activity of activities) {
          if (activity._id === parentActivityId) {
            if (!activity.subActivities) {
              activity.subActivities = [];
            }
            activity.subActivities.push(updatedActivity);
            return true;
          }
          if (activity.subActivities && findAndAddToParent(activity.subActivities)) {
            return true;
          }
        }
        return false;
      };

      const added = findAndAddToParent(project.activities);
      if (!added) {
        // If parent not found, add to root level
        project.activities.push(updatedActivity);
      }
    }
  }

  deleteActivity(project, activityId) {
    if (!project || !activityId) {
      this.addError('Invalid project or activity ID');
      return;
    }

    const removedActivity = this.removeActivityFromProject(project, activityId);

    if (!removedActivity) {
      this.addError('Activity not found');
      return;
    }

    this._modal.closeModal();

    this.fetchProject(project).then((updatedProject) => {
      this.modifyProject(updatedProject);
    }).catch((error) => {
      this.addError(`Failed to delete activity: ${error.message}`);
      // Revert the deletion
      this.addActivityToProject(project, removedActivity, null);
    });
  }

  openModal(taskId, project, isNewActivity) {
    const form = this.shadowRoot.querySelector('#activityForm');
    this._modal.setTitle(isNewActivity ? 'Add New Activity' : 'Edit Activity');
    const parentActivitySelect = form.querySelector('#parentActivitySelect');

    form.reset();

    if (isNewActivity) {
      form.dataset.isNew = 'true';
      form.querySelector('#activityParticipants').value = this.user ? this.user.username + ',' : '';
      this.populateParentActivitySelect(parentActivitySelect, project.activities);
    } else {
      form.dataset.isNew = 'false';
      const activity = this.findActivity(project.activities, taskId);
      if (activity) {
        form.querySelector('#activityName').value = activity.name;
        const startDate = new Date(activity.startDate || activity.dueDate);
        form.querySelector('#activityStartDate').value = startDate.toISOString().split('T')[0];
        form.querySelector('#activityDueDate').value = new Date(activity.dueDate).toISOString().split('T')[0];
        form.querySelector('#activityParticipants').value = activity.participants ? activity.participants.join(', ') : '';
        form.querySelector('#activityDescription').value = activity.description || '';
        form.dataset.activity = JSON.stringify(activity);

        if (parentActivitySelect.children.length === 1) {
          const parentActivity = this.project.activities.find(a => a.subActivities && a.subActivities.find(sa => sa._id === activity._id));
          this.populateParentActivitySelect(parentActivitySelect, project.activities, parentActivity);
        }
      }
    }

    this._modal.openModal();  // Apri il modale
  }

  findActivity(activities, id) {
    for (const activity of activities) {
      if (activity._id === id) {
        return activity;
      }
      if (activity.subActivities) {
        const found = this.findActivity(activity.subActivities, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  populateParentActivitySelect(select, activities, currentParentActivity = null) {
    activities.forEach(activity => {
      let option = document.createElement('option');
      option.value = activity._id;
      option.textContent = activity.name;
      select.appendChild(option);
      if (currentParentActivity && currentParentActivity._id === activity._id) {
        option.selected = true;
      }
    });
  }

  handleFormSubmit(e, project) {
    e.preventDefault();
    if (!project) {
      this.addError('Error updating project: Project not found');
      return;
    }
    const form = e.target;
    const isNewActivity = form.dataset.isNew === 'true';
    const oldActivity = !isNewActivity ? JSON.parse(form.dataset.activity) : null;
    let subActivities = oldActivity && oldActivity.subActivities ? oldActivity.subActivities : [];
    const parentActivityId = form.querySelector('#parentActivitySelect').value === '' ? null : form.querySelector('#parentActivitySelect').value;

    const activityData = {
      name: form.querySelector('#activityName').value,
      startDate: new Date(form.querySelector('#activityStartDate').value),
      dueDate: new Date(form.querySelector('#activityDueDate').value),
      participants: form.querySelector('#activityParticipants').value.split(',').map(p => p.trim()).filter(p => p !== ''),
      description: form.querySelector('#activityDescription').value,
      completed: false,
      subActivities: subActivities,
      _id: oldActivity ? oldActivity._id : null
    };

    if (isNewActivity) {
      this.addActivityToProject(project, activityData, parentActivityId);
    } else {
      this.updateActivityInProject(project, activityData, parentActivityId);
    }

    this.fetchProject(project).then((data) => {
      this.modifyProject(data);
    }).catch((error) => {
      this.addError(error.message);
    });
  }

  async fetchProject(project) {
    const response = await fetch(`/api/projects/${project._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ project }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`${data.message}`);
    }

    if (!data.project) {
      throw new Error('Project data not found');
    }

    return data.project;
  }

  renderGanttChart(activities, days, startDate) {
    const header = this.renderGanttHeader(days);
    const rows = activities && activities.length > 0 ? activities.map(activity => this.renderGanttRow(activity, days, startDate)).join('') : '<div>No activities found</div>';
    return `
      <div class="gantt-header">${header}</div>
      ${rows}
    `;
  }

  renderGanttHeader(days) {
    return `
      <div class="gantt-cell task-info"><h2>Task</h2></div>
      <div class="gantt-cell days-column">Days</div>
      <div class="gantt-cell start-date-column">Start Date</div>
      <div class="gantt-cell end-date-column">End Date</div>
      <div class="gantt-cell participants-column">Participants</div>
      ${days.map(day => `<div class="gantt-cell" style="letter-spacing:1px;">${day.getDate()}/${day.getMonth() + 1}</div>`).join('')}
    `;
  }
  isActivityFullyComplete(activity) {
    if (!activity.subActivities || activity.subActivities.length === 0) {
      return activity.completed;
    }

    const allSubActivitiesComplete = activity.subActivities.every(subActivity =>
      this.isActivityFullyComplete(subActivity)
    );

    return activity.completed && allSubActivitiesComplete;
  }

  // Add this helper method to your class
  isActivityFullyComplete(activity) {
    if (!activity.subActivities || activity.subActivities.length === 0) {
      return activity.completed;
    }

    const allSubActivitiesComplete = activity.subActivities.every(subActivity =>
      this.isActivityFullyComplete(subActivity)
    );

    return activity.completed && allSubActivitiesComplete;
  }

  getActivityCompletionStatus(activity, parentActivity = null) {
    // If it's a leaf activity (no sub-activities)
    if (!activity.subActivities || activity.subActivities.length === 0) {
      return activity.completed ? 'completed' : 'pending';
    }

    // Check if all sub-activities are complete
    const allSubActivitiesComplete = activity.subActivities.every(subActivity =>
      this.isActivityFullyComplete(subActivity)
    );

    // Check if some sub-activities are complete
    const someSubActivitiesComplete = activity.subActivities.some(subActivity =>
      this.isActivityFullyComplete(subActivity)
    );

    if (activity.completed && allSubActivitiesComplete) {
      return 'completed';
    } else if (activity.completed || someSubActivitiesComplete) {
      return 'partial-completed';
    } else {
      return 'pending';
    }
  }

  // Updated renderGanttRow method
  renderGanttRow(activity, days, startDate, level = 0, parentActivity = null) {
    const activityStart = new Date(activity.startDate || activity.dueDate);
    const activityEnd = new Date(activity.dueDate);
    const duration = this.getDaysBetween(activityStart, activityEnd).length;
    const completionStatus = this.getActivityCompletionStatus(activity, parentActivity);

    const rowHtml = `
    <div class="gantt-row">
      <div class="gantt-cell task-info task-name" data-activity-id="${activity._id}">
        ${level === 1 ? '<span class="subactivity"></span>' : ''} ${activity.name}
      </div>
      <div class="gantt-cell days-column">${duration}</div>
      <div class="gantt-cell start-date-column">${this.formatDate(activityStart)}</div>
      <div class="gantt-cell end-date-column">${this.formatDate(activityEnd)}</div>
      <div class="gantt-cell participants-column">
        ${activity.participants?.length > 0 ? activity.participants.join(', ') : 'no one'}
      </div>
      ${days.map(day => {
      const dayTimestamp = day.getTime();
      const activityStartTimestamp = activityStart.getTime();
      const activityEndTimestamp = activityEnd.getTime();

      if (dayTimestamp >= activityStartTimestamp && dayTimestamp <= activityEndTimestamp) {
        return `<div class="gantt-cell ${completionStatus} gantt-task-cell "></div>`;
      }
      return '<div class="gantt-cell"></div>';
    }).join('')}
    </div>
  `;

    const subActivitiesHtml = activity.subActivities
      ? activity.subActivities
        .map(subActivity => this.renderGanttRow(subActivity, days, startDate, level + 1, activity))
        .join('')
      : '';

    return rowHtml + subActivitiesHtml;
  }


  getDaysBetween(start, end) {
    const days = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }

  formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }
}

export default ProjectCard;
