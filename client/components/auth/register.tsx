"use client";

import { createAuthCookie, register } from "@/actions/auth.action";
import { RegisterSchema } from "@/helpers/schemas";
import { RegisterFormType, RegisterType } from "@/helpers/types";
import { Button, Input } from "@nextui-org/react";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Stepper from "@/components/stepper/stepper";

export const Register = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = ["Account", "Personal Info", "Address"];

  const initialValues: RegisterFormType = {
    name: "user",
    surname: "user",
    email: "test@gmail.com",
    password: "usersss",
    confirmPassword: "usersss",
    country: "India",
    zip: "123456",
    city: "Chennai",
    state: "Tamil Nadu",
    address: "123, 4th street, Chennai",
    phoneNumber: "1234567890",
    username: "admin",
    birthDate: new Date(),
  };

  const handleRegister = useCallback(
    async (values: RegisterFormType) => {
      try {
        const response = await register(values as RegisterType);
        await createAuthCookie(response.token);
        router.replace("/");
      } catch (err: Error | any) {
        setError(err?.response?.data?.message || err.message);
      }
    },
    [router],
  );

  const handleNextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <>
      <div className="text-center text-[25px] font-bold mb-6">Register</div>

      <Stepper currentStep={currentStep} steps={steps} goToStep={goToStep} />

      <Formik
        initialValues={initialValues}
        validationSchema={RegisterSchema}
        onSubmit={handleRegister}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <>
            {currentStep === 0 && (
              <div className="flex flex-col w-1/2 gap-4 mb-4">
                <div className="flex flex-row gap-4">
                  <Input
                    variant="bordered"
                    label="Name"
                    value={values.name}
                    isInvalid={!!errors.name && !!touched.name}
                    errorMessage={errors.name}
                    onChange={handleChange("name")}
                  />
                  <Input
                    variant="bordered"
                    label="Surname"
                    value={values.surname}
                    isInvalid={!!errors.surname && !!touched.surname}
                    errorMessage={errors.surname}
                    onChange={handleChange("surname")}
                  />
                </div>
                <Input
                  variant="bordered"
                  label="Username"
                  value={values.username}
                  isInvalid={!!errors.username && !!touched.username}
                  errorMessage={errors.username}
                  onChange={handleChange("username")}
                />
                <Input
                  variant="bordered"
                  label="Email"
                  type="email"
                  value={values.email}
                  isInvalid={!!errors.email && !!touched.email}
                  errorMessage={errors.email}
                  onChange={handleChange("email")}
                />
              </div>
            )}
            {currentStep === 1 && (
              <div className="flex flex-col w-1/2 gap-4 mb-4">
                <Input
                  variant="bordered"
                  label="Password"
                  type="password"
                  value={values.password}
                  isInvalid={!!errors.password && !!touched.password}
                  errorMessage={errors.password}
                  onChange={handleChange("password")}
                />
                <Input
                  variant="bordered"
                  label="Confirm password"
                  type="password"
                  value={values.confirmPassword}
                  isInvalid={
                    !!errors.confirmPassword && !!touched.confirmPassword
                  }
                  errorMessage={errors.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                />
                <Input
                  variant="bordered"
                  label="Birth Date"
                  type="date"
                  value={values.birthDate.toString()}
                  isInvalid={!!errors.birthDate && !!touched.birthDate}
                  onChange={handleChange("birthDate")}
                />
                <Input
                  variant="bordered"
                  label="Phone Number"
                  value={values.phoneNumber}
                  isInvalid={!!errors.phoneNumber && !!touched.phoneNumber}
                  errorMessage={errors.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                />
              </div>
            )}
            {currentStep === 2 && (
              <div className="flex flex-col w-1/2 gap-4 mb-4">
                <Input
                  variant="bordered"
                  label="Address"
                  value={values.address}
                  isInvalid={!!errors.address && !!touched.address}
                  errorMessage={errors.address}
                  onChange={handleChange("address")}
                />
                <div className="flex flex-row gap-4">
                  <Input
                    variant="bordered"
                    label="City"
                    value={values.city}
                    isInvalid={!!errors.city && !!touched.city}
                    errorMessage={errors.city}
                    onChange={handleChange("city")}
                  />
                  <Input
                    variant="bordered"
                    label="State"
                    value={values.state}
                    isInvalid={!!errors.state && !!touched.state}
                    errorMessage={errors.state}
                    onChange={handleChange("state")}
                  />
                  <Input
                    variant="bordered"
                    label="Zip"
                    value={values.zip}
                    isInvalid={!!errors.zip && !!touched.zip}
                    errorMessage={errors.zip}
                    onChange={handleChange("zip")}
                  />
                </div>
                <Input
                  variant="bordered"
                  label="Country"
                  value={values.country}
                  isInvalid={!!errors.country && !!touched.country}
                  errorMessage={errors.country}
                  onChange={handleChange("country")}
                />
              </div>
            )}

            {error && (
              <div className="font-bold text-slate-400 mt-4 text-sm text-red-500">
                {error}
              </div>
            )}
            <div className="flex flex-row gap-4">
              <Button
                onPress={handlePrevStep}
                variant="flat"
                color="primary"
                disabled={currentStep === 0}
              >
                Back
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button
                  onPress={() => handleSubmit()}
                  variant="flat"
                  color="primary"
                >
                  Register
                </Button>
              ) : (
                <Button onPress={handleNextStep} variant="flat" color="primary">
                  Next
                </Button>
              )}
            </div>
          </>
        )}
      </Formik>

      <div className="font-light text-slate-400 mt-4 text-sm">
        <Button
          variant="flat"
          color="secondary"
          onPress={() => router.push("/login")}
        >
          Already have an account? <b>Login</b>
        </Button>
      </div>
    </>
  );
};
