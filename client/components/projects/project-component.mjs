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
}

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
