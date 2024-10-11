// project-component.mjs

// Definizione della classe ProjectCard
class ProjectCard extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({ mode: 'open' });
		const wrapper = document.createElement('div');
		wrapper.setAttribute('class', 'project-card');

		const style = document.createElement('style');
		style.textContent = `
      .project-card {
        border: 1px solid #ccc;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
        font-family: Arial, sans-serif;
      }
      h2 {
        margin-top: 0;
      }
      .activities-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
        margin-top: 20px;
      }
      .activity-card {
        background-color: #f0f0f0;
        border-radius: 5px;
        padding: 10px;
      }
      .activity-title {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .activity-date {
        font-size: 0.8em;
        color: #666;
      }
      .activity-status {
        font-size: 0.8em;
        margin-top: 5px;
      }
      .completed {
        color: green;
      }
      .pending {
        color: orange;
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
		if (wrapper) {
			wrapper.innerHTML = `
        <h2>${project.title}</h2>
        <p>${project.description}</p>
        <div class="activities-grid">
          ${this.renderActivities(project.activities)}
        </div>
      `;
		}
	}

	renderActivities(activities) {
		return activities.map(activity => `
      <div class="activity-card">
        <div class="activity-title">${activity.name}</div>
        <div class="activity-date">
          ${new Date(activity.dueDate).toLocaleDateString()}
        </div>
        <div class="activity-status ${activity.completed ? 'completed' : 'pending'}">
          ${activity.completed ? 'Completed' : 'Pending'}
        </div>
      </div>
    `).join('');
	}
}

customElements.define('project-card', ProjectCard);

export default ProjectCard;

// Definizione della classe ProjectComponent
class ProjectComponent extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this._projects = []; // Variabile privata per memorizzare i progetti
		this.currentIndex = 0; // Indice del progetto corrente

		const wrapper = document.createElement('div');
		wrapper.setAttribute('class', 'project-component');

		const style = document.createElement('style');
		style.textContent = `
      .project-component {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: 5px;
      }
      .project-navigation {
        margin-top: 10px;
      }
      button {
        padding: 5px 10px;
        margin: 0 5px;
        cursor: pointer;
      }
				project-card {
								width: 100%;
}
    `;

		this.shadowRoot.appendChild(style);
		this.shadowRoot.appendChild(wrapper);
	}

	get projects() {
		return this._projects;
	}

	set projects(value) {
		if (Array.isArray(value)) {
			this._projects = value;
			this.currentIndex = 0; // Reset all'inizio dei progetti
			this.render(); // Renderizza i progetti
		}
	}

	render() {
		const wrapper = this.shadowRoot.querySelector('.project-component');
		if (!wrapper || this._projects.length === 0) return;

		wrapper.innerHTML = ''; // Pulisce il contenuto corrente

		// Renderizza la project card corrente
		const project = this._projects[this.currentIndex];
		const projectCard = document.createElement('project-card');
		projectCard.setAttribute('project', JSON.stringify(project));

		// Aggiunge la project card al wrapper
		wrapper.appendChild(projectCard);

		// Aggiunge i pulsanti di navigazione (Previous e Next)
		const navDiv = document.createElement('div');
		navDiv.setAttribute('class', 'project-navigation');

		const prevButton = document.createElement('button');
		prevButton.textContent = 'Previous';
		prevButton.disabled = this.currentIndex === 0;
		prevButton.addEventListener('click', () => this.showPrevious());

		const nextButton = document.createElement('button');
		nextButton.textContent = 'Next';
		nextButton.disabled = this.currentIndex === this._projects.length - 1;
		nextButton.addEventListener('click', () => this.showNext());

		navDiv.appendChild(prevButton);
		navDiv.appendChild(nextButton);

		wrapper.appendChild(navDiv);
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

// Esportiamo le classi separatamente
export { ProjectCard, ProjectComponent };
