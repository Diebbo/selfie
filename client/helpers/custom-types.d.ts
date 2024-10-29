import { ProjectModel } from '@/helpers/types';
export {};

declare global {
  interface HTMLElementTagNameMap {
    'project-component': ProjectComponentElement;
  }

  // Aggiungi supporto JSX per il custom element
  namespace JSX {
    interface IntrinsicElements {
      'project-component': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        projects?: ProjectModel[];
      };
      'project-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        project: ProjectModel;
      };
      'modal-component': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }

  }
}

// Definisci l'interfaccia del custom element
interface ProjectComponentElement extends HTMLElement {
  projects: ProjectModel[];
}

