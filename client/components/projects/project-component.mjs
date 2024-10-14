// project-component.js

class ProjectCard extends HTMLElement {
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
        <h2>${project.title}</h2>
        <p>${project.description}</p>
        <div class="gantt-chart">
          ${this.renderGanttChart(project.activities, days, startDate)}
        </div>
      `;
		}
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
		console.log(activityStart, activityEnd, startOffset, duration);
		console.log(activity.participants);
	
		const rowHtml = `
      <div class="gantt-row">
        <div class="gantt-cell task-info">${level === 1 ? "<span class=\"subactivity\"></span>" : ""} ${activity.name}</div>
        <div class="gantt-cell days-column">${duration}</div>
        <div class="gantt-cell start-date-column">${this.formatDate(activityStart)}</div>
        <div class="gantt-cell end-date-column">${this.formatDate(activityEnd)}</div>
        <div class="gantt-cell participants-column">${activity.participants && activity.participants.lenght > 0 ? activity.participants.join(', ') : "no one"}</div>
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

		const subActivitiesHtml = activity.subActivity
			? activity.subActivity.map(subActivity => this.renderGanttRow(subActivity, days, startDate, level + 1)).join('')
			//this.renderGanttRow(activity.subActivity, days, startDate, level + 1)
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

class ProjectComponent extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._projects = [];
		this.currentIndex = 0;

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
      button {
        padding: 8px 16px;
        margin: 0 5px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
      }
      button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    `;

		this.shadowRoot.appendChild(style);
	}

	connectedCallback() {
		this.render();
	}

	set projects(value) {
		if (Array.isArray(value)) {
			this._projects = value;
			this.render();
		}
	}

	render() {
		this.shadowRoot.innerHTML = '';
		if (this._projects.length === 0) return;

		const projectCard = document.createElement('project-card');
		projectCard.setAttribute('project', JSON.stringify(this._projects[this.currentIndex]));
		this.shadowRoot.appendChild(projectCard);

		const navigation = document.createElement('div');
		navigation.className = 'navigation';

		const prevButton = document.createElement('button');
		prevButton.textContent = 'Previous';
		prevButton.disabled = this.currentIndex === 0;
		prevButton.addEventListener('click', () => this.showPrevious());

		const nextButton = document.createElement('button');
		nextButton.textContent = 'Next';
		nextButton.disabled = this.currentIndex === this._projects.length - 1;
		nextButton.addEventListener('click', () => this.showNext());

		navigation.appendChild(prevButton);
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

customElements.define('project-card', ProjectCard);
customElements.define('project-component', ProjectComponent);

export { ProjectCard, ProjectComponent };
