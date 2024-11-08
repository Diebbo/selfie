import { ProjectModel, Person } from '@/helpers/types';
import React from 'react';

export { };

declare global {
  interface HTMLProjectComponentElement extends HTMLElement {
    projects: ProjectModel[];
    _user?: Person;
    friends: String[];
    time: Date;
  }

  // Update the tag name map
  interface HTMLElementTagNameMap {
    'project-component': HTMLProjectComponentElement;
    'project-card': HTMLElement;
  }

  // Provide JSX support for custom elements
  namespace JSX {
    interface IntrinsicElements {
      'project-component': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLProjectComponentElement>,
        HTMLProjectComponentElement
      >;
      'project-card': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLProjectCardElement>,
        HTMLProjectCardElement
      >;
      'modal-component': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
