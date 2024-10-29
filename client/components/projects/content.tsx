// components/projects/content.tsx
'use client';
import { useEffect, useRef } from 'react';
import { Person, ProjectModel } from '@/helpers/types';
import ProjectCard from './project-card.mjs';
import Modal from './project-modal.mjs';
import './project-component.js';
import './project-modal.js';
import './project-card.js';

interface ContentProps {
  projects: ProjectModel[];
  user: Person;
}

export default function Content({ projects, user }: ContentProps) {
  const projectComponentRef = useRef<ProjectComponent | null>(null);

  useEffect(() => {
    // Passa i progetti al custom element quando disponibile
    if (projectComponentRef.current) {
      projectComponentRef.current.projects = projects;
      projectComponentRef.current._user = user;
      // projectComponentRef.classList.add('font-sans', 'bg-gray-900', 'text-white');
    }
  }, [projects, user]);

  return (
    <div className="m-3">
      <project-component ref={projectComponentRef}></project-component>
    </div>
  );
}
