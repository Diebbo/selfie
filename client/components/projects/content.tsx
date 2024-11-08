// components/projects/content.tsx
'use client';
import { useEffect, useRef } from 'react';
import { Person, ProjectModel } from '@/helpers/types';
import './project-component.js';
import './project-modal.js';
import './project-card.js';
import { useTime } from '../contexts/TimeContext';

interface ContentProps {
  projects: ProjectModel[];
  user: Person;
}

export default function Content({ projects, user }: ContentProps) {
  const projectComponentRef = useRef<HTMLProjectComponentElement | null>(null);
  const { currentTime } = useTime();

  useEffect(() => {
    // Passa i progetti al custom element quando disponibile
    if (projectComponentRef.current) {
      projectComponentRef.current.projects = projects;
      projectComponentRef.current._user = user;
      projectComponentRef.current.friends = user.friends.map((friend) => friend.username);
      projectComponentRef.current.time = currentTime;
      // projectComponentRef.classList.add('font-sans', 'bg-gray-900', 'text-white');
    }
  }, [user, projects, currentTime]);

  return (
    <div className="m-3">
      <project-component ref={projectComponentRef}></project-component>
    </div>
  );
}
