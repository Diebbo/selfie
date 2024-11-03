import React from 'react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";
import { ChevronDown } from "lucide-react";

type StepProps = {
  currentStep: number;
  steps: string[];
  goToStep: (step: number) => void;
};

const Stepper: React.FC<StepProps> = ({ currentStep, steps, goToStep }) => {
  return (
    <div className="flex justify-center mb-6">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="shadow" className="w-48">
            {steps[currentStep]}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu className="w-48" variant="shadow">
          {steps.map((step, index) => (
            <DropdownItem
              key={index}
              onClick={() => goToStep(index)}
              className={`${
                currentStep === index ? 'bg-primary/10' : ''
              } cursor-pointer`}
            >
              {step}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Stepper;
