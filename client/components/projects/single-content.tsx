"use client";
import { useState, useEffect, useRef } from 'react';
import { Person, ProjectModel } from '@/helpers/types';
import router from 'next/router';
import './project-card';
import './project-modal';
import { Button } from '@nextui-org/react';

interface ContentProps {
  projects: ProjectModel[];
  user: Person;
  id: string;
}

export default function Content({ projects, user, id }: ContentProps) {
  // Stato del progetto selezionato e del caricamento
  const [project, setProject] = useState<ProjectModel | undefined>(
    projects.find((p) => p._id === id)
  );
  
  // Change the ref type to HTMLElement
  const projectCardRef = useRef<HTMLElement | null>(null);

  // Gestore eliminazione progetto
  const handleDeleteProject = () => {
    router.push('/');
  };

  // Aggiornamento dello stato del progetto
  const handleUpdateProject = (updatedProject: ProjectModel) => {
    setProject(updatedProject);
  };

  // Effetto per assegnare attributi e aggiungere listener dopo il montaggio
  useEffect(() => {
    if (projectCardRef.current && project && user) {
      // Imposta gli attributi project e user in modo sicuro
      projectCardRef.current.setAttribute('project', JSON.stringify(project));
      projectCardRef.current.setAttribute('user', JSON.stringify(user));
      
      // Aggiunge i listener per gli eventi custom
      const deleteHandler = () => handleDeleteProject();
      const updateHandler = (event: Event) => {
        const updateEvent = event as CustomEvent<{ project: ProjectModel }>;
        handleUpdateProject(updateEvent.detail.project);
      };

      // Uncomment and update if you want to add event listeners
      projectCardRef.current.addEventListener('delete-project', deleteHandler);
      projectCardRef.current.addEventListener('update-project', updateHandler as EventListener);

      // Cleanup: rimuove i listener al dismount del componente
      return () => {
        projectCardRef.current.removeEventListener('delete-project', deleteHandler);
        projectCardRef.current.removeEventListener('update-project', updateHandler as EventListener);
      };
    }
    console.log('Rendering content', { project, user, projectCardRef });
  }, [project, user]);

  if (!project || !user) {
    return <div>Project not found</div>;
  }

  return (
    <div className="m-3">
      <Button variant='flat' color='primary' className='mb-3' onClick={() => router.push('/')}>Go back</Button>
      <project-card ref={projectCardRef}></project-card>
    </div>
  );
}
