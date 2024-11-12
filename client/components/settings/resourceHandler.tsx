'use clinet';

import React from 'react';
import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { ResourceModel } from '@/helpers/types';
import { X } from 'lucide-react';

interface ResourceHandlerProps {
  isAdmin: Boolean;
  handleNewResource: (name: string) => void;
  allResources: ResourceModel[] | null;
}

const ResourceHandler: React.FC<ResourceHandlerProps> = ({ isAdmin, handleNewResource, allResources }) => {
  const [resourceName, setResourceName] = React.useState('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  console.log("non contento", Array(allResources));

  const handleResourceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    console.log("nome della risorsa", name);
    setResourceName(name);
  };

  const handleDeleteResource = async (name: string) => {
    try {
      const res = await fetch("/api/events/resource", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name }),
      });
      const data = await res.json();
      console.log(data);

      // Chiudi il dropdown dopo l'eliminazione
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Errore durante l'eliminazione della risorsa:", error);
    }
  }

  return (
    <div>
      <h2 className='mb-2'>
        Add new resource
      </h2>
      <div className='items-center justify-center mb-4 flex flex-row gap-2'>
        {isAdmin && (
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
                  {allResources && allResources.length > 0 ? (
                    allResources.map((resource, index) => (
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
        )}
      </div>
    </div>
  );
};

export default ResourceHandler;
