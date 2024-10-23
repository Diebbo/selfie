/*class ProjectCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'project-card');

    const style = document.createElement('style');
    style.textContent = `
      .project-card {
        font-family: Arial, sans-serif;
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      h2 {
        margin-top: 0;
        color: #333;
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
      .gantt-cell {
        flex: 1;
        min-width: 40px;
        height: 30px;
        border-right: 1px solid #e0e0e0;
        text-align: center;
        font-size: 12px;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .gantt-cell:last-child {
        border-right: none;
      }
      .gantt-task {
        background-color: #4CAF50;
        height: 20px;
        border-radius: 3px;
      }
      .gantt-task.completed {
        background-color: #2196F3;
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
        margin-left: 10px;
      }
      .days-column, .start-date-column, .end-date-column {
        min-width: 100px;
        max-width: 100px;
      }
      .participants-column {
        min-width: 150px;
        max-width: 150px;
      }
        .pending {
        background-color: #f5f5f5;
}
.completed {
        background-color: #4CAF50;
}

      .modal {
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
  border-radius: 15px;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.4);
      }
      .modal-content {
        background-color: #fefefe;
        margin: 15% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 500px;
      }
      .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      .close:hover,
      .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
      }
      .modal input, .modal textarea {
        width: 100%;
        padding: 8px;
        margin: 8px 0;
        box-sizing: border-box;
      }
      .modal button {
        color: white;
        padding: 10px 15px;
        border: none;
        cursor: pointer;
        margin-top: 10px;
        border-radius: 4px;
      }
.success {
        background-color: #4CAF50;
}
      .modal button:hover {
        background-color: #45a049;
      }
          .add-activity-btn {
        background-color: #4CAF50;
        color: white;
        padding: 10px 15px;
        border: none;
        cursor: pointer;
        margin-top: 10px;
      }
      .add-activity-btn:hover {
        background-color: #45a049;
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
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const wrapper = this.shadowRoot.querySelector('.project-card');
    const project = JSON.parse(this.getAttribute('project'));

    if (wrapper && project) {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.deadline);
      const days = this.getDaysBetween(startDate, endDate);

      wrapper.innerHTML = `
        <h2>${project.title}<button class="delete" id="delete-proj">delete</button></h2>
        <p>${project.description}</p>
        <button class="add-activity-btn">Add Activity</button>
        <div class="gantt-chart">
          ${this.renderGanttChart(project.activities, days, startDate)}
        </div>
        <div id="activityModal" class="modal">
          <div class="modal-content">
            <span class="close">&times;</span>
            <h2 id="modalTitle">Edit Activity</h2>
            <form id="projectForm">
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
          </div>
        </div>
      `;

      this.addEventListeners(project);
    }
  }

  addError(message) {
    const errorElement = document.createElement('div');
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    querySelector('modal-content').appendChild(errorElement);
  }

  addEventListeners(project) {
    const taskElements = this.shadowRoot.querySelectorAll('.task-name');
    const modal = this.shadowRoot.querySelector('#activityModal');
    const closeBtn = modal.querySelector('.close');
    const form = this.shadowRoot.querySelector('#projectForm');
    const addActivityBtn = this.shadowRoot.querySelector('.add-activity-btn');
    const deleteProjectBtn = this.shadowRoot.querySelector("#delete-proj");
    const deleteActivityBtn = form.querySelector('#delete-activity');

    taskElements.forEach((task) => {
      task.addEventListener('click', () => this.openModal(task, project, false));
    });

    addActivityBtn.addEventListener('click', () => this.openModal(null, project, true));

    closeBtn.addEventListener('click', () => this.closeModal());
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        this.closeModal();
      }
    });

    form.addEventListener('submit', (e) => this.handleFormSubmit(e, project));

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
      const activityId = JSON.parse(form.dataset.activity)._id;
      this.deleteActivity(project, activityId);
    });
  }

  deleteActivity(project, activityId) {
    project.activities.forEach(activity => {
      activity.subActivities = activity.subActivities.filter(subActivity => subActivity._id !== activityId);
    });
    project.activities = project.activities.filter(activity => activity._id !== activityId);

    this.fetchProject(project).then((data) => {
      console.log(data.message, data.project);
      this.setAttribute('project', JSON.stringify(data.project));
      this.render();
      this.closeModal();
    }).catch((error) => {
        addError('Error deleting activity:', error.message);
    });
  }

  openModal(task, project, isNewActivity) {
    const modal = this.shadowRoot.querySelector('#activityModal');
    const form = this.shadowRoot.querySelector('#projectForm');
    const modalTitle = this.shadowRoot.querySelector('#modalTitle');
    const parentActivitySelect = form.querySelector('#parentActivitySelect');

    modalTitle.textContent = isNewActivity ? 'Add New Activity' : 'Edit Activity';
    form.reset();

    if (isNewActivity) {
      form.dataset.isNew = 'true';
      this.populateParentActivitySelect(parentActivitySelect, project.activities);
    } else {
      form.dataset.isNew = 'false';
      const activity = this.findActivity(project.activities, task.textContent.trim());
      if (activity) {
        form.querySelector('#activityName').value = activity.name;
        const startDate = new Date(activity.startDate || activity.dueDate);
        form.querySelector('#activityStartDate').value = startDate.toISOString().split('T')[0];
        form.querySelector('#activityDueDate').value = new Date(activity.dueDate).toISOString().split('T')[0];
        form.querySelector('#activityParticipants').value = activity.participants ? activity.participants.join(', ') : '';
        form.querySelector('#activityDescription').value = activity.description || '';
        form.dataset.activity = JSON.stringify(activity);

        if (parentActivitySelect.children.length === 1) {
          this.populateParentActivitySelect(parentActivitySelect, project.activities, activity);
        }
      }
    }

    modal.style.display = 'block';

  }

  findActivity(activities, name) {
    for (const activity of activities) {
      if (activity.name === name) {
        return activity;
      }
      if (activity.subActivities) {
        const found = this.findActivity(activity.subActivities, name);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  populateParentActivitySelect(select, activities, currentActivity = null) {
    activities.forEach(activity => {
      if (activity !== currentActivity) {
        const option = document.createElement('option');
        option.value = activity._id;
        option.textContent = activity.name;
        select.appendChild(option);
      }
    });
  }

  closeModal() {
    const modal = this.shadowRoot.querySelector('#activityModal');
    modal.style.display = 'none';
  }

  handleFormSubmit(e, project) {
    e.preventDefault();
    const form = e.target;
    const isNewActivity = form.dataset.isNew === 'true';
    const oldActivity = JSON.parse(form.dataset.activity);
    let subActivities = oldActivity.subActivities ? oldActivity.subActivities : [];
    const parentActivityId = form.querySelector('#parentActivitySelect').value;

    const activityData = {
      name: form.querySelector('#activityName').value,
      startDate: new Date(form.querySelector('#activityStartDate').value),
      dueDate: new Date(form.querySelector('#activityDueDate').value),
      participants: form.querySelector('#activityParticipants').value.split(',').map(p => p.trim()),
      description: form.querySelector('#activityDescription').value,
      completed: false,
      subActivities: subActivities
    };

    if (isNewActivity) {
      this.addActivityToProject(project, activityData, parentActivityId);
    } else {
      this.updateActivityInProject(project, activityData, parentActivityId);
    }

    console.log('Updated project:', project);
    this.fetchProject(project).then((data) => {
      console.log(data.message, data.project);
      this.setAttribute('project', JSON.stringify(data.project));
      this.render();
      this.closeModal();
    }).catch((error) => {
      addError('Error updating project:', error.message);
    });
  }

  updateActivityInProject(project, updatedActivity, parentActivityId) {
    const updateInParent = (activities) => {
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];

        // Verifica se è l'attività che stiamo cercando basandoci sull'ID
        if (activity._id === JSON.parse(this.shadowRoot.querySelector('#projectForm').dataset.activity)._id) {
          activities[i] = {
            ...activity,  // Mantiene i campi esistenti
            ...updatedActivity // Aggiorna i campi con quelli nuovi
          };
          return true;
        }

        // Se ha sotto-attività, ricorri per trovare e aggiornare anche lì
        if (activity.subActivities && updateInParent(activity.subActivities)) {
          return true;
        }
      }
      return false;
    };

    updateInParent(project.activities);
  }

  addActivityToProject(project, newActivity, parentActivityId) {
    if (!parentActivityId) {
      project.activities.push(newActivity);
    } else {
      const addToParent = (activities) => {
        for (const activity of activities) {
          if (activity._id === parentActivityId) {
            if (!activity.subActivities) {
              activity.subActivities = [];
            }
            activity.subActivities.push(newActivity);
            return true;
          }
          if (activity.subActivities && addToParent(activity.subActivities)) {
            return true;
          }
        }
        return false;
      };

      addToParent(project.activities);
    }
  }

  generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  async fetchProject(project) {
    const response = await fetch(`/api/projects/${project._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ project }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  renderGanttChart(activities, days, startDate) {
    const header = this.renderGanttHeader(days);
    const rows = activities.map(activity => this.renderGanttRow(activity, days, startDate)).join('');
    return `
      <div class="gantt-header">${header}</div>
      ${rows}
    `;
  }

  renderGanttHeader(days) {
    return `
      <div class="gantt-cell task-info">Task</div>
      <div class="gantt-cell days-column">Days</div>
      <div class="gantt-cell start-date-column">Start Date</div>
      <div class="gantt-cell end-date-column">End Date</div>
      <div class="gantt-cell participants-column">Participants</div>
      ${days.map(day => `<div class="gantt-cell" style="letter-spacing:1px;">${day.getDate()}/${day.getMonth() + 1}</div>`).join('')}
    `;
  }

  renderGanttRow(activity, days, startDate, level = 0) {
    const activityStart = new Date(activity.startDate || activity.dueDate);
    const activityEnd = new Date(activity.dueDate);
    const startOffset = this.getDaysBetween(startDate, activityStart).length;
    const duration = this.getDaysBetween(activityStart, activityEnd).length;

    const rowHtml = `
      <div class="gantt-row">
        <div class="gantt-cell task-info task-name">${level === 1 ? "<span class=\"subactivity\"></span>" : ""} ${activity.name}</div>
        <div class="gantt-cell days-column">${duration}</div>
        <div class="gantt-cell start-date-column">${this.formatDate(activityStart)}</div>
        <div class="gantt-cell end-date-column">${this.formatDate(activityEnd)}</div>
        <div class="gantt-cell participants-column">${activity.participants && (activity.participants.length > 0) ? activity.participants.join(', ') : "no one"}</div>
${days.map((day, index) => {
      const dayTimestamp = day.getTime();
      const activityStartTimestamp = activityStart.getTime();
      const activityEndTimestamp = activityEnd.getTime();

      if (dayTimestamp >= activityStartTimestamp && dayTimestamp <= activityEndTimestamp) {
        return `<div class="gantt-cell ${activity.completed ? 'completed' : 'pending'}"></div>`;
      }
      return `<div class="gantt-cell"></div>`;
    }).join('')}
      </div>
    `;

    const subActivitiesHtml = activity.subActivities
      ? activity.subActivities.map(subActivities => this.renderGanttRow(subActivities, days, startDate, level + 1)).join('')
      //this.renderGanttRow(activity.subActivities, days, startDate, level + 1)
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
}*/

class ProjectComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._projects = [];
    this._user = null;
    this.currentIndex = 0;
    this._modal = null;
    this.addEventListener('delete-project', this.handleDeleteProject);
    this.addEventListener('update-project', this.handleSaveProject);
  }

  handleSaveProject(event) {
    const fetchedProject = event.detail.project;
    this._projects = this._projects.map(project => {
      if (project._id === fetchedProject._id) {
        return fetchedProject;
      }
      return project;
    });
  }

  setupStyle() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: Arial, sans-serif;
      }
      .navigation {
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }
      .navigation button {
        padding: 8px 16px;
        margin: 0 5px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        margin-left: 10px;
      }
      .navigation button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
#projectForm input, #projectForm textarea {
        width: 100%;
        padding: 8px;
        margin: 8px 0;
        box-sizing: border-box;
      }
#projectForm button {
        color: white;
        padding: 10px 15px;
        border: none;
        cursor: pointer;
        margin-top: 10px;
        border-radius: 4px;
      }
.success {
        background-color: #4CAF50;

    `;

    this.shadowRoot.appendChild(style);
  }

  handleDeleteProject(event) {
    const projectId = event.detail.projectId;

    // Send API request to delete the project
    this.sendDeleteProjectRequest(projectId).then((data) => {
      this._projects = this._projects.filter(project => project._id !== projectId);
      if (this.currentIndex >= this._projects.length) {
        this.currentIndex = Math.max(0, this._projects.length - 1);
      }
      this.render();
    }).catch((error) => {
      console.error('Error deleting project:', error.message);
    });
  }

  async sendDeleteProjectRequest(projectId) {
    // In a real application, you would send an API request here
    console.log(`Sending request to delete project with ID: ${projectId}`);
    // Simulating an API call
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
  }

  connectedCallback() {
    this.setupStyle();
    this.render();
  }

  set projects(value) {
    if (Array.isArray(value)) {
      this._projects = value;
      this.render();
    }
  }

  openModal({ title, startDate, deadline, description }) {
    this._modal = this.shadowRoot.querySelector('#projectModal');
    const form = this._modal.querySelector('#projectForm');
    this._modal.setTitle('New Project');
    form.reset();
    form.querySelector('#projectTitle').value = title || '';
    form.querySelector('#projectStartDate').value = new Date(startDate).toISOString().split('T')[0];
    form.querySelector('#projectDeadline').value = new Date(deadline).toISOString().split('T')[0];
    form.querySelector('#projectDescription').value = description || '';
    form.querySelector('#projectMembers').value = this._user ? this._user.username + ',' : '';


    form.dataset.isNew = 'true';
    this._modal.openModal();
  }

  createHandleSave() {
    const formDOM = this.shadowRoot.querySelector('#projectForm');
    const addProject = (newProject) => {
      console.log('Adding new project:', newProject);
      this._projects.push(newProject);
      this.currentIndex = this._projects.length - 1;
      this._modal.closeModal();
      this.render();
    }
    return (e) => {
      e.preventDefault();

      const getFormData = (form) => {
        const title = form.querySelector('#projectTitle').value;
        const startDate = form.querySelector('#projectStartDate').value;
        const deadline = form.querySelector('#projectDeadline').value;
        const description = form.querySelector('#projectDescription').value;
        const members = form.querySelector('#projectMembers').value.split(',').map(m => m.trim());

        return {
          title,
          startDate:new Date(startDate),
          deadline:new Date(deadline),
          description,
          activities: [],
          members
        };
      };
      const newProject = getFormData(formDOM);
      fetch('/api/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({project:newProject})
      }).then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Error creating project');
      }).then((data) => {
        addProject(data.project);
      }).catch((error) => {
        this._modal.setError('Error creating project:', error.message);
      });
    }
  };

  render() {
    // Save the style element
    const style = this.shadowRoot.querySelector('style');

    // Clear the shadow DOM
    this.shadowRoot.innerHTML = '';

    // Re-add the style element
    if (style) {
      this.shadowRoot.appendChild(style);
    }

    if (this._projects.length === 0) return;

    const projectCard = document.createElement('project-card');
    projectCard.setAttribute('project', JSON.stringify(this._projects[this.currentIndex]));
    projectCard.setAttribute('user', JSON.stringify(this._user));
    this.shadowRoot.appendChild(projectCard);


    const modal = document.createElement('modal-component');
    modal.setAttribute('id', 'projectModal');
    modal.innerHTML = `
      <h2 id="modalTitle"></h2>
      <form id="projectForm">
        <input type="text" id="projectTitle" placeholder="Project Title" required>
        <input type="date" id="projectStartDate" placeholder="Start Date" required>
        <input type="date" id="projectDeadline" placeholder="Deadline" required>
        <input type="text" id="projectMembers" placeholder="Members (comma-separated)">
        <textarea id="projectDescription" placeholder="Description" required></textarea>
        <button type="submit" class="success">Save Changes</button>
      </form>
    `;
    this.shadowRoot.appendChild(modal);
    const form = this.shadowRoot.querySelector('#projectForm');
    if (form) {
      form.addEventListener('submit', this.createHandleSave());
    }

    const navigation = document.createElement('div');
    navigation.className = 'navigation';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = this.currentIndex === 0;
    prevButton.addEventListener('click', () => this.showPrevious());

    const newProjectButton = document.createElement('button');
    newProjectButton.textContent = 'New Project';
    newProjectButton.addEventListener('click', () => {
      this.openModal({ title: '', startDate: new Date(), deadline: new Date(), description: '' });
    });

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = this.currentIndex === this._projects.length - 1;
    nextButton.addEventListener('click', () => this.showNext());

    navigation.appendChild(prevButton);
    navigation.appendChild(newProjectButton);
    navigation.appendChild(nextButton);
    this.shadowRoot.appendChild(navigation);
  }

  showPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.render();
    }
  }

  showNext() {
    if (this.currentIndex < this._projects.length - 1) {
      this.currentIndex++;
      this.render();
    }
  }
}


export default ProjectComponent;
