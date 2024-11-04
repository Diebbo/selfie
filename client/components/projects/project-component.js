class ProjectComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._projects = [];
    this._user = null;
    this.currentIndex = 0;
    this._modal = null;
    this._friends = [];
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

  // Inject Tailwind styles into shadow DOM
  setupStyle() {
    this.shadowRoot.innerHTML = `
      <style>
:host {
  display: block;
  font-family: var(--font-sans, system-ui, sans-serif); /* Fonte definita */
}

.navigation {
  display: flex;
  justify-content: center;
  margin-top: 1.25rem; /* mt-5 */
}

.navigation button {
  padding: 0.5rem 1rem; /* px-4 py-2 */
  margin-left: 0.25rem; /* mx-1 */
  margin-right: 0.25rem;
  cursor: pointer;
  background-color: var(--tw-color-secondary, #3490dc); /* bg-secondary */
  color: white;
  border: none;
  border-radius: 0.375rem; /* rounded-md */
  font-size: 0.875rem; /* text-sm */
  margin-left: 0.625rem; /* ml-2.5 */
  transition: background-color 0.2s ease;
}

.navigation button:hover {
  background-color: var(--tw-color-primary-600, #2563eb); /* hover:bg-primary-600 */
}

.navigation button:disabled {
  background-color: #d1d5db; /* disabled:bg-gray-300 */
  cursor: not-allowed;
}

#newProject {
  background-color: var(--tw-color-primary, #4f46e5); /* bg-primary */
}

#projectForm input,
#projectForm textarea,
#projectForm select {
  width: 100%;
  padding: 0.5rem; /* p-2 */
  margin-top: 0.5rem; /* my-2 */
  margin-bottom: 0.5rem;
  box-sizing: border-box;
  border-radius: 0.5rem; /* rounded-lg */
  border: 1px solid #e5e7eb; /* border-gray-200 */
  outline: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

#projectForm input:focus,
#projectForm textarea:focus {
  box-shadow: 0 0 0 2px var(--tw-ring-primary, #3b82f6); /* focus:ring-primary */
}

#projectForm button {
  color: white;
  padding: 0.625rem 1rem; /* py-2.5 px-4 */
  border: none;
  cursor: pointer;
  margin-top: 0.625rem; /* mt-2.5 */
  border-radius: 0.375rem; /* rounded-md */
}

.success {
  background-color: var(--tw-color-success, #10b981); /* bg-success */
  transition: background-color 0.2s ease;
}

.success:hover {
  background-color: var(--tw-color-success-600, #047857); /* hover:bg-success-600 */
}
      </style>
    `;
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
  }

  set projects(value) {
    if (Array.isArray(value)) {
      this._projects = value;
      this.render();
    }
  }

  set friends(value) {
    if (Array.isArray(value)) {
      this._friends = value;
      this.render();
    }
  }

  populateSelectMembers(select) {
    this._friends.forEach(friend => {
      const option = document.createElement('option');
      option.value = friend;
      option.textContent = friend;
      select.appendChild(option);
    });

    const userOption = document.createElement('option');
    userOption.value = this._user._id;
    userOption.textContent = this._user.name;
    userOption.selected = true;
    select.appendChild(userOption);
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
    const membersForm = form.querySelector('#projectMembers');
    this.populateSelectMembers(membersForm);

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
        const multipleSelect = form.querySelector('#projectMembers');
        const members = Array.from(multipleSelect.selectedOptions).map(option => option.value);

        return {
          title,
          startDate: new Date(startDate),
          deadline: new Date(deadline),
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
        body: JSON.stringify({ project: newProject })
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
    // Clear the shadow DOM
    this.shadowRoot.innerHTML = '';

    this.setupStyle();

    if (this._projects.length > 0) {
      const projectCard = document.createElement('project-card');
      projectCard.setAttribute('project', JSON.stringify(this._projects[this.currentIndex]));
      projectCard.setAttribute('user', JSON.stringify(this._user));
      this.shadowRoot.appendChild(projectCard);
    } else {
      const noProjdiv = document.createElement('div');
      noProjdiv.className = 'no-projects';
      this.shadowRoot.appendChild(noProjdiv);
      const noProjects = document.createElement('p');
      noProjects.textContent = 'No projects found';
      noProjdiv.appendChild(noProjects);
    }


    const modal = document.createElement('modal-component');
    modal.setAttribute('id', 'projectModal');
    modal.innerHTML = `
      <h2 id="modalTitle"></h2>
      <form id="projectForm">
        <input type="text" id="projectTitle" placeholder="Project Title" required>
        <input type="date" id="projectStartDate" placeholder="Start Date" required>
        <input type="date" id="projectDeadline" placeholder="Deadline" required>
        <select id="projectMembers" multiple>
        </select>
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

customElements.define('project-component', ProjectComponent);
