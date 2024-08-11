import { Button } from "@nextui-org/react";

type StepProps = {
	currentStep: number;
	steps: string[];
	goToStep: (step: number) => void;
};

const Stepper: React.FC<StepProps> = ({ currentStep, steps, goToStep }) => {
	return (
		<div className="flex justify-center mb-6">
			{steps.map((step, index) => (
				<div key={index} className="flex items-center">
					<Button
						// onPress={() => goToStep(index)}
						//disabled={true}
						color={currentStep === index ? "primary" : "default"}
					>
						{step}
					</Button>
					{index < steps.length - 1 && (
						<div className="mx-2 h-px flex-1 bg-gray-300" />
					)}
				</div>
			))}
		</div>
	);
};

export default Stepper;
