'use clinet';

'use client';

import React from 'react';
import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { ResourceModel } from '@/helpers/types';

interface ResourceHandlerProps {
  isAdmin: Boolean;
  handleNewResource: (name: string) => void;
  allResources: ResourceModel[] | null;
}

const ResourceHandler: React.FC<ResourceHandlerProps> = ({ isAdmin, handleNewResource, allResources }) => {
  const [resourceName, setResourceName] = React.useState('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [resources, setResources] = React.useState<ResourceModel[] | null>(allResources);

  // Aggiorna lo state locale quando cambiano le props
  React.useEffect(() => {
    setResources(allResources);
  }, [allResources]);

  const handleResourceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    console.log("nome della risorsa", name);
    setResourceName(name);
  };

  const handleDeleteResource = async (name: string) => {
    try {
      const res = await fetch("/api/events/resource/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name }),
      });
      const data = await res.json();
      console.log(data);

      if (res.ok) {
        // Aggiorna lo state locale rimuovendo la risorsa eliminata
        setResources(prevResources =>
          prevResources ? prevResources.filter(resource => resource.name !== name) : null
        );

        // Emetti un evento custom per notificare il componente padre
        const event = new CustomEvent('resourceDeleted', {
          detail: { deletedResourceName: name }
        });
        window.dispatchEvent(event);
      }

      // Chiudi il dropdown dopo l'eliminazione
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Errore durante l'eliminazione della risorsa:", error);
    }
  }

  return (
    <div>
      {isAdmin && (
        <div>
          <h2 className='mb-2'>
            Add new resource
          </h2>
          <div className='items-center justify-center mb-4 flex flex-row gap-2'>
            <>
              <Input
                placeholder="Enter resource name"
                value={resourceName}
                onChange={(e) => handleResourceNameChange(e)}
              />
              <div className="flex gap-2">
                <Button
                  color='primary'
                  onClick={() => {
                    handleNewResource(resourceName);
                    setResourceName("");
                  }}
                >
                  Add resource
                </Button>

                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      color="secondary"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      Show Resources
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Resources list"
                    className="max-h-[300px] overflow-y-auto"
                  >
                    {resources && resources.length > 0 ? (
                      resources.map((resource, index) => (
                        <DropdownItem
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span>{resource.name}</span>
                          <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            className="ml-2 border-1 border-danger"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteResource(resource.name);
                            }}
                          >
                            Remove
                          </Button>
                        </DropdownItem>
                      ))
                    ) : (
                      <DropdownItem>No resources available</DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceHandler;
