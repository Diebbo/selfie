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
    }
  }
}

// Definisci l'interfaccia del custom element
interface ProjectComponentElement extends HTMLElement {
  projects: ProjectModel[];
}

