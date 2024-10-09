'use client';
import { useEffect } from 'react';
import { ProjectModel } from '@/helpers/types';

// Define the web component
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
      }
      h2 {
        margin-top: 0;
      }
    `;

		shadow.appendChild(style);
		shadow.appendChild(wrapper);
	}

	connectedCallback() {
		this.render();
	}

	render() {
		const wrapper = this.shadowRoot?.querySelector('.project-card');
		if (wrapper) {
			wrapper.innerHTML = `
        <h2>${this.getAttribute('title')}</h2>
        <p>${this.getAttribute('description')}</p>
      `;
		}
	}
}

interface ContentProps {
	projects: ProjectModel[];
}

export default function Content({ projects }: ContentProps) {
	useEffect(() => {
		// Register the web component
		if (!customElements.get('project-card')) {
			customElements.define('project-card', ProjectCard);
		}
	}, []);

	return (
		<>
			{projects.map((project: ProjectModel) => (
				<project-card
					key={project.id}
					title={project.title}
					description={project.description}
				></project-card>
			))}
		</>
	);
}
