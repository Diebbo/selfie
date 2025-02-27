class ProjectCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'project-card');
        this.user = null;
        this.project = null;
        this.time = null;

        this.setupStyle();
        shadow.appendChild(wrapper);

        this._modal = null;
    }

    setupStyle() {
        const style = document.createElement('style');
        this.shadowRoot.appendChild(style);
        const existingStyles = `
        button:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }
      .project-card {
        min-width: 300px;
        padding: 1.25rem; 
        border-radius: 0.5rem; 
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); 
        background-color: hsl(var(--nextui-secondary-100)); 
      }

      .project-card .title {
        margin-top: 0; 
        color: hsl(var(--nextui-secondary)); 
        font-weight: 600; 
        font-size: 1.5rem; 
      }

      .gantt-chart {
          background-color: hsl(var(--nextui-gantt-bg-color));
          padding: 0.625rem; 
          display: flex;
          flex-flow: row nowrap;
      }

      .overlay-gantt {
        overflow-x: auto;
      }

      .fixed-gantt,
      .overlay-gantt {
          display: flex;
          flex-direction: column;
      }

      .gantt-header,
      .gantt-row {
          display: flex;
          align-items: center;
      }

      .current-date {
        background-color: hsl(var(--nextui-primary-100));
      }

      .gantt-cell {
          flex-shrink: 0;
          border-right: 1px solid hsl(var(--nextui-default-400));
          text-align: center;
          padding: 0.5rem; 
          font-size: 0.75rem;
          color: hsl(var(--nextui-text-color));
          min-width: 35px; 
          max-width: 35px;
          height: 20px; 
          transition: background-color 0.3s ease; 
      }

      .overlay-gantt .gantt-cell:last-child {
          border-right: none; 
      }

      .gantt-task-cell {
        position: relative;
      }

      .gantt-task-cell.completed {
          background-color: hsl(var(--nextui-success)); 
      }
            .gantt-task-cell.in-progress {
          background-color: hsl(var(--nextui-warning)); 
      }

      .gantt-task-cell.pending {
          background-color: hsl(var(--nextui-primary-50));
      }

      .gantt-task-cell.passed {
          background-color: hsl(var(--nextui-danger));
      }

      .task-title {
        font-weight: bold;
      }

      .task-info {
          min-width: 150px;
          max-width: 150px;
          padding-right: 0.625rem;
          flex-shrink: 0;
            justify-content: start;
        align-items: center;
          display: flex;
          overflow-y: hidden;
            overflow-x: hidden;
      }
    .task-info span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

      .task-info:hover, .task-info:active {
          cursor: pointer; 
          color: #3182ce; 
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
          .gantt-cell {
              font-size: 0.625rem; 
          }
          .task-info {
            max-width: 100px;
            overflow-x: auto;
          }

      }
.subactivity {
    margin-left: 1.25rem; 
}

.tooltip {
  position: absolute;
  background: hsl(var(--nextui-default-100));
  color: hsl(var(--nextui-foreground));
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tooltip.visible {
  opacity: 1;
}

.days-column {
    min-width: 50px; 
    max-width: 50px; 
}

.start-date-column,
.end-date-column {
    min-width: 80px;
    max-width: 80px;
}

.participants-column {
    min-width: 150px; 
    max-width: 150px; 
    overflow: hidden; 
}

.success {
    background-color: #38a169; 
}

.add-activity-btn {
    background-color: hsl(var(--nextui-success)); 
    color: white; 
    padding: 0.5rem; 
    border: none; 
    cursor: pointer; 
    margin-top: 0.625rem; 
    border-radius: 0.375rem; 
}

.parent-activity-select {
    width: 100%; 
    padding: 0.5rem; 
    margin: 0.5rem 0; 
    box-sizing: border-box; 
}

.delete {
    background-color: hsl(var(--nextui-danger)); 
    color: white; 
    padding: 0.375rem 0.625rem; 
    border: none; 
    cursor: pointer; 
    border-radius: 0.375rem; 
    float: right; 
}

#activityForm input,
#activityForm textarea,
#activityForm select{
    width: 100%; 
    padding: 0.5rem; 
    margin: 0.5rem 0; 
    box-sizing: border-box; 
    border-radius: 0.5rem; 
    border: 1px solid #e2e8f0; 
    outline: none; 
    transition: ring-2 0.2s ease-in-out; 
}

#activityForm ul {
    width: 100%; 
    padding: 0.5rem; 
    margin: 0.5rem 0; 
    outline: none;
}
#activityForm button {
    color: white; 
    padding: 0.625rem 1rem; 
    border: none; 
    cursor: pointer; 
    margin-top: 0.625rem; 
    border-radius: 0.375rem; 
}

.header-inline {
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
} 
      .edit-button { /* bg transparent */
        background-color: transparent;
        color: white; 
        padding: 0.375rem 0.625rem; 
        border: none; 
        cursor: pointer; 
        border-radius: 0.375rem; 
        margin-right: 5px;
      }
    `;
        const newStyles = `
            .status-pending {
                background-color: hsl(var(--nextui-warning-200));
            }
            .status-in-progress {
                background-color: hsl(var(--nextui-primary-200));
            }
            .status-completed {
                background-color: hsl(var(--nextui-success-200));
            }
            .status-blocked {
                background-color: hsl(var(--nextui-danger-200));
            }
            
            .activity-meta {
                font-size: 0.75rem;
                color: hsl(var(--nextui-foreground-400));
                margin-top: 0.25rem;
            }
            
            .comment-count {
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
                margin-left: 0.5rem;
            }
        `;
        style.textContent = existingStyles + newStyles;
    }

    connectedCallback() {
        // Initial render
        this.render();
    }

    // Observe these attributes for changes
    static get observedAttributes() {
        return ['project', 'user', 'time'];
    }

    // Handle attribute changes
    attributeChangedCallback(name, oldValue, newValue) {
        if ((name === 'project' || name === 'user' || name === 'time') && oldValue !== newValue) {
            // Reset the stored data to force re-parsing
            if (name === 'project') {
                this.project = undefined;
            }
            if (name === 'user') {
                this.user = undefined;
            }
            if (name === 'time') {
                this.time = undefined;
            }
            this.render();
        }
    }

    updateData() {
        try {
            // Always parse fresh from attributes
            this.project = JSON.parse(this.getAttribute('project') || '{}');
            this.user = JSON.parse(this.getAttribute('user') || '{}');
            this.time = this.getAttribute('time') ? new Date(this.getAttribute('time')) : new Date();
        } catch (error) {
            console.error("Error parsing 'project' or 'user' attributes:", error);
            return false;
        }
        return true;
    }
    render() {
        const wrapper = this.shadowRoot.querySelector('.project-card');
        try {
            this.updateData();
        } catch (error) {
            console.error("Errore nel parsing dei dati 'project' o 'user':", error);
            return;
        }

        if (!wrapper || !this.project || !this.project.startDate || !this.project.deadline) {
            console.warn("Project o dati mancanti. Impossibile aggiornare il contenuto.", this.project);
            if (wrapper) {
                wrapper.innerHTML = '<p>Project data not found</p>';
            }
            if (!this.project.startDate) {
                console.warn("Data di inizio progetto non trovata");
            }
            if (!this.project.deadline) {
                console.warn("Data di scadenza progetto non trovata");
            }
            return;
        }

        const startDate = new Date(this.project.startDate);
        const endDate = new Date(this.project.deadline);
        const days = this.getDaysBetween(startDate, endDate);

        wrapper.innerHTML = `
        <div class="headers-inline">
          <h2 class="title" style="display:inline;">${this.project.title}</h2>
          <button class="delete" id="delete-proj">delete</button>
        </div>
        <h3>${this.project.description}</h3>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4>Members: ${this.project.members.join(', ')}</h4>
            <h5>Creator: ${this.project.creator}</h5>
        </div>
        <button class="add-activity-btn">Add Activity</button>
        <div class="gantt-chart">
          ${this.renderGanttChart(this.project.activities, days, startDate)}
        </div>
        <modal-component id="activityModal">
          <form id="activityForm">
            <input type="text" id="activityTitle" placeholder="Activity Title" required>
            <label for="activityStartDate">From - To Date</label>
            <div class="header-inline">
                <input 
                    type="date" 
                    min="${startDate.toISOString().split('T')[0]}"
                    max="${endDate.toISOString().split('T')[0]}"
                    id="activityStartDate" placeholder="Start Date" required>
                <input type="date" 
                    min="${startDate.toISOString().split('T')[0]}"
                    max="${endDate.toISOString().split('T')[0]}"
                    id="activityDueDate" placeholder="Due Date" required>
            </div>
            <label for="activityAssignees">Assignees</label>
            <select id="activityAssignees" multiple>
            </select>
            <label for="activityStatus">Status</label>
            <select id="activityStatus">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>
            <input type="text" id="activityInputs" placeholder="Input1, input2,... (comma-separated)" />
            <input type="text" id="activityOutputs" placeholder="Output1, output2,... (comma-separated)" />
            <ul id="previousComments"></ul>
            <textarea id="comments" placeholder="comments"></textarea>
            <select id="parentActivitySelect" class="parent-activity-select">
              <option value="">No Parent (Top-level Activity)</option>
            </select>
            <button type="submit" class="success">Save Changes</button>
            <button type="button" class="delete" id="delete-activity">Delete Activity</button>
          </form>
        </modal-component>
      `;

        this._modal = this.shadowRoot.querySelector('modal-component');

        const overlayGanttRows = this.shadowRoot.querySelector('.overlay-gantt');

        // Restore the last scroll position from localStorage
        const lastScrollLeft = localStorage.getItem('overlayGanttScrollTop');
        if (lastScrollLeft) {
            overlayGanttRows.scrollLeft = parseInt(lastScrollLeft, 10);
        }

        // Add an event listener to save the scroll position on scroll
        overlayGanttRows.addEventListener('scroll', () => {
            localStorage.setItem('overlayGanttScrollTop', overlayGanttRows.scrollLeft);
        });

        // Event listeners per apertura modale 
        // deep clone project to avoid modifying the original
        this.addEventListeners(JSON.parse(JSON.stringify(this.project)));
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

        const ganttCells = this.shadowRoot.querySelectorAll('.gantt-task-cell');
        ganttCells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const activityId = cell.parentElement.dataset.activityId;
                this.toggleActivityCompletion(activityId, project);
            });
            cell.addEventListener('mouseover', (e) => {
                // make background color lighter
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                e.target.style.cursor = 'pointer';
            });
            cell.addEventListener('mouseout', (e) => {
                e.target.style.backgroundColor = '';
            });
        });

        const editButtons = this.shadowRoot.querySelectorAll('.edit-button');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Previene il bubbling dell'evento
                const activityId = button.parentElement.parentElement.dataset.activityId;
                this.openModal(activityId, this.project, false);
            });
        });

        const infoCells = this.shadowRoot.querySelectorAll('.task-name');
        infoCells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const activityId = cell.parentElement.dataset.activityId;
                this.openModal(activityId, project, false);
            }
            );
        });

        addActivityBtn.addEventListener('click', () => {
            this.openModal(null, project, true);
        });

        // check if the user is the creator of the project
        if (this.user && this.user.username !== project.creator) {
            deleteProjectBtn.setAttribute('disabled', true);
            addActivityBtn.setAttribute('disabled', true);
        }

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

        form.querySelector('#comments').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const commentsInput = form.querySelector('#comments');
                const commentsList = form.querySelector('#previousComments');
                const comment = commentsInput.value.trim();
                if (comment) {
                    // remove default message
                    if (commentsList.querySelector('li')?.textContent === 'No comments') {
                        commentsList.innerHTML = '';
                    }
                    const li = document.createElement('li');
                    li.textContent = project.creator + ': ' + comment;
                    commentsList.appendChild(li);
                    commentsInput.value = '';
                }
            }
        });

        let sidebar = document.querySelector(".sidebar");

        let top = localStorage.getItem("sidebar-scroll");
        if (top !== null) {
            sidebar.scrollTop = parseInt(top, 10);
        }

        // add event listener to save current scroll position of lateral bar
        window.addEventListener("beforeunload", () => {
            localStorage.setItem("sidebar-scroll", sidebar.scrollTop);
        });
        this.setupTooltips();
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
        this.project = project;
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
            // Revert the deletion
        });
    }

    populateAssigneeSelect(select, assignees, currentAssignees = []) {
        select.innerHTML = '';
        if (!assignees || assignees.length === 0) {
            select.innerHTML = '<option value="">No assignees</option>';
        }
        assignees?.forEach(assignee => {
            let option = document.createElement('option');
            option.value = assignee;
            option.textContent = assignee;
            if (currentAssignees.includes(assignee)) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    populateActivityComments(ul, comments) {
        ul.innerHTML = '';
        if (!comments || comments.length === 0) {
            ul.innerHTML = '<li>No comments</li>';
        }
        comments?.forEach(comment => {
            let li = document.createElement('li');
            li.textContent = `${comment.creator}: ${comment.comment}`;
            ul.appendChild(li);
        });
    }


    openModal(taskId, project, isNewActivity) {
        const form = this.shadowRoot.querySelector('#activityForm');
        this._modal.setTitle(isNewActivity ? 'Add New Activity' : 'Edit Activity');

        // Reset the form
        const parentActivitySelect = form.querySelector('#parentActivitySelect');
        const select = form.querySelector('#activityAssignees');
        const ul = form.querySelector('#previousComments');
        const activityI = form.querySelector('#activityInputs');
        const activityO = form.querySelector('#activityOutputs');
        form.reset();

        const activity = this.findActivity(project.activities, taskId);

        if (isNewActivity || !activity) {
            form.dataset.isNew = 'true';
            form.querySelector('#activityAssignees').value = this.user ? this.user.username + ',' : '';
            this.populateAssigneeSelect(select, project.members);
            this.populateParentActivitySelect(parentActivitySelect, project.activities);
            this.populateActivityComments(ul, null);
        } else {
            form.dataset.isNew = 'false';
            form.querySelector('#activityTitle').value = activity.title;
            const startDate = new Date(activity.startDate || activity.dueDate);
            form.querySelector('#activityStartDate').value = startDate.toISOString().split('T')[0];
            form.querySelector('#activityDueDate').value = new Date(activity.dueDate).toISOString().split('T')[0];

            if (activity.inputs) activityI.value = activity.inputs?.join(', ');
            if (activity.outputs) activityO.value = activity.outputs?.join(', ');
            this.populateAssigneeSelect(select, project.members, activity.assignees);

            this.populateActivityComments(ul, activity.comments);

            form.dataset.activity = JSON.stringify(activity);

            const parentActivity = this.project.activities.find(a => a.subActivities?.some(sa => sa._id === activity._id));
            this.populateParentActivitySelect(parentActivitySelect, project.activities, parentActivity ? parentActivity._id : null, activity._id);
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

    populateParentActivitySelect(select, activities, currentParentActivityId = null, currentActivityId = null) {
        select.innerHTML = '<option value="">No Parent (Top-level Activity)</option>';
        activities.forEach(activity => {
            let option = document.createElement('option');
            option.value = activity._id;
            option.textContent = activity.title;
            if (currentParentActivityId && currentParentActivityId === activity._id) { // Set the current parent activity as selected
                option.selected = true;
            } else if (!currentParentActivityId && currentActivityId && currentActivityId === activity._id) {
                return; // Don't show the current activity as a parent
            }
            select.appendChild(option);
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

        const selectElement = form.querySelector('#activityAssignees');
        const assaignees = Array.from(selectElement.selectedOptions).map(option => option.value);


        const commentList = form.querySelector('#previousComments');
        const comments = [];
        commentList.querySelectorAll('li').forEach(li => {
            if (li.textContent === 'No comments') return;
            const [creator, comment] = li.textContent.split(':').map(item => item.trim());
            comments.push({ creator, comment });
        });

        const activityData = {
            title: form.querySelector('#activityTitle').value,
            startDate: new Date(form.querySelector('#activityStartDate').value),
            dueDate: new Date(form.querySelector('#activityDueDate').value),
            assignees: assaignees,
            status: form.querySelector('#activityStatus').value,
            inputs: form.querySelector('#activityInputs').value?.split(',').map(input => input.trim()) || [],
            outputs: form.querySelector('#activityOutputs').value?.split(',').map(output => output.trim()) || [],
            subActivities: subActivities,
            _id: oldActivity ? oldActivity._id : undefined,
            comments: comments,
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

    addActivityToProject(project, activity, parentActivityId) {
        if (!project || !activity) {
            this.addError('Invalid project or activity data');
            return;
        }

        if (!parentActivityId) {
            project.activities.push(activity);
        } else {
            project.activities.forEach(parentActivity => {
                if (parentActivity._id === parentActivityId) {
                    if (!parentActivity.subActivities) {
                        parentActivity.subActivities = [];
                    }
                    parentActivity.subActivities.push(activity);
                }
            });
        }
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
        const rowsHtml = activities.map(activity => this.renderGanttRow(activity, days, startDate));
        const fixedGanttRows = rowsHtml.map(
            (row) => {
                return row.rowHtml.fixedHtml +
                    row?.subActivitiesHtml?.map(subActivity => subActivity.rowHtml.fixedHtml).join('');
            }).join('');
        const overlayGanttRows = rowsHtml.map(
            (row) => {
                return row.rowHtml.overlayHtml +
                    row?.subActivitiesHtml?.map(subActivity => subActivity.rowHtml.overlayHtml).join('');
            }).join('');

        return `
      <div class="fixed-gantt">
        <div class="gantt-header">
          ${this.renderFixedGanttHeader()}
        </div>
        ${fixedGanttRows}
      </div>
      <div class="overlay-gantt">
        <div class="gantt-header">
          ${this.renderOverlayGanttHeader(days)}
        </div>
        ${overlayGanttRows}
      </div>
    `;
    }

    renderFixedGanttHeader() {
        return `
        <div class="gantt-cell task-info task-title">Task</div>
        
      `;
    }

    renderOverlayGanttHeader(days) {
        return `
        <div class="gantt-cell days-column">Days</div>
        <div class="gantt-cell start-date-column">Start Date</div>
        <div class="gantt-cell end-date-column">End Date</div>
        <div class="gantt-cell participants-column">Assignees</div>
      ${days.map(day => `<div class="gantt-cell${this.areSameDate(day, this.time) ? ' current-date' : ''}">${day.getDate()}/${day.getMonth() + 1}</div>`).join('')}
    `;
    }

    areSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }


    isActivityFullyComplete(activity) {
        const isCompleted = activity.status === 'completed';
        if (!activity.subActivities || activity.subActivities.length === 0) {
            return isCompleted;
        }

        const allSubActivitiesComplete = activity.subActivities.every(subActivity =>
            this.isActivityFullyComplete(subActivity)
        );

        return isCompleted && allSubActivitiesComplete;
    }

    getActivityCompletionStatus(activity, parentActivity = null) {
        // If it's a leaf activity (no sub-activities)
        if (!activity.subActivities || activity.subActivities.length === 0) {
            return activity.status;
        }

        // Check if all sub-activities are complete
        const allSubActivitiesComplete = activity.subActivities.every(subActivity =>
            this.isActivityFullyComplete(subActivity)
        );

        // Check if some sub-activities are complete
        const someSubActivitiesComplete = activity.subActivities.some(subActivity =>
            this.isActivityFullyComplete(subActivity)
        );

        const completed = activity.status === 'completed';

        if (completed && allSubActivitiesComplete) {
            return 'completed';
        } else if (completed || someSubActivitiesComplete) {
            return 'in-progress';
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

        const rowHtml = {
            fixedHtml: `
      <div class="gantt-row" data-activity-id="${activity._id}">
        <div class="gantt-cell task-info task-name">
          <button class="edit-button" title="Edit activity">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </button>
          <span>
            ${level === 1 ? '<span class="subactivity"></span>' : ''} ${activity.title}
          </span>
        </div>
      </div>
              `,
            overlayHtml: `
      <div class="gantt-row" data-activity-id="${activity._id}">
        <div class="gantt-cell days-column">${duration}</div>
        <div class="gantt-cell start-date-column">${this.formatDate(activityStart)}</div>
        <div class="gantt-cell end-date-column">${this.formatDate(activityEnd)}</div>
        <div class="gantt-cell participants-column">
          ${activity.assignees?.length > 0 ? activity.assignees.join(', ') : 'no one'}
        </div>

        ${days.map(day => {
                const dayTimestamp = day.getTime();
                const activityStartTimestamp = activityStart.getTime();
                const activityEndTimestamp = activityEnd.getTime();

                if (dayTimestamp >= activityStartTimestamp && dayTimestamp <= activityEndTimestamp) {
                    return `<div class="gantt-task-cell gantt-cell ${completionStatus}" 
                 data-activity-name="${activity.title}"
                 data-status="${activity.status}"></div>`;
                }
                return '<div class="gantt-cell"></div>';
            }).join('')
                }
      </div>
  `};

        const subActivitiesHtml = activity.subActivities
            ? activity.subActivities.map(subActivity => this.renderGanttRow(subActivity, days, startDate, level + 1, activity))
            : [];

        return { rowHtml, subActivitiesHtml };
    }

    setupTooltips() {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        this.shadowRoot.appendChild(tooltip);

        const taskCells = this.shadowRoot.querySelectorAll('.gantt-task-cell');

        taskCells.forEach(cell => {
            cell.addEventListener('mouseover', (e) => {
                const activityName = cell.dataset.activityName;
                const status = cell.dataset.status;
                tooltip.textContent = `${activityName}: ${status}`;

                // Posiziona il tooltip
                // using the mouse coordinates
                const cords = cell.getBoundingClientRect();
                const sideBarOff = window.innerWidth > 768 ? 200 : 0;
                const x = cords.left + window.scrollX - sideBarOff;
                const y = cords.top + window.scrollY;
                tooltip.style.left = `${x + 10}px`;
                tooltip.style.top = `${y + 20}px`;

                tooltip.classList.add('visible');
            });

            cell.addEventListener('mouseout', () => {
                tooltip.classList.remove('visible');
            });
            cell.addEventListener('click', () => {
                tooltip.classList.remove('visible');
            });
        });
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

customElements.define('project-card', ProjectCard);
