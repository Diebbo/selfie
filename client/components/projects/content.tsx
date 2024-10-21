// components/projects/content.tsx
'use client';
import { useEffect, useRef } from 'react';
import { ProjectModel } from '@/helpers/types';
import ProjectCard from './project-card.mjs';
import ProjectComponent from './project-component.mjs';
import Modal from './project-modal.mjs';

interface ContentProps {
  projects: ProjectModel[];
}

export default function Content({ projects }: ContentProps) {
  const projectComponentRef = useRef<ProjectComponent | null>(null);

  useEffect(() => {
    // Registra i web components
    if (!customElements.get('project-card')) {
      customElements.define('project-card', ProjectCard);
    }
    if (!customElements.get('project-component')) {
      customElements.define('project-component', ProjectComponent);
    }
    if (!customElements.get('modal-component')) {
      customElements.define('modal-component', Modal);
    }


  }, []);

  useEffect(() => {
    // Passa i progetti al custom element quando disponibile
    if (projectComponentRef.current) {
      projectComponentRef.current.projects = projects;
    }
  }, [projects]);

  return (
    <>
      <project-component ref={projectComponentRef}></project-component>
    </>
  );
}
