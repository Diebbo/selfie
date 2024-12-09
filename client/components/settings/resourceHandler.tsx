'use client';

import React, { useState } from 'react';
import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { ResourceModel } from '@/helpers/types';

interface ResourceHandlerProps {
  isAdmin: Boolean;
  handleNewResource: (name: string) => Promise<ResourceModel | null>;
  handleDeleteResource: (name: string) => Promise<void>;
  allResources: ResourceModel[] | null;
}

const ResourceHandler: React.FC<ResourceHandlerProps> = ({
  isAdmin,
  handleNewResource,
  handleDeleteResource,
  allResources
}) => {
  const [resourceName, setResourceName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleResourceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setResourceName(name);
  };

  const handleAddResource = async () => {
    await handleNewResource(resourceName);
    setResourceName("");
  };

  const onDeleteResource = async (name: string) => {
    await handleDeleteResource(name);
    setIsDropdownOpen(false);
  };

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
                  onClick={handleAddResource}
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
                    {Array.isArray(allResources) && allResources.length > 0 ? (
                      allResources.map((resource) => (
                        <DropdownItem
                          key={resource._id}
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
                              onDeleteResource(resource.name);
                            }}
                          >
                            Remove
                          </Button>
                        </DropdownItem>
                      ))
                    ) : (
                      <DropdownItem key="none">No resources available</DropdownItem>
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
