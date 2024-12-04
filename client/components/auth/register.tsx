"use client";

import { createAuthCookie, register } from "@/actions/auth.action";
import { RegisterSchema } from "@/helpers/schemas";
import { RegisterFormType, RegisterType } from "@/helpers/types";
import { Button, Input } from "@nextui-org/react";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useState } from "react";
import Stepper from "@/components/stepper/stepper";

export const Register = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = ["Account", "Personal Info", "Address"];

  const initialValues: RegisterFormType = {
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    country: "Italia",
    zip: "",
    city: "Bologna",
    state: "Emilia Romagna",
    address: "",
    phoneNumber: "",
    birthDate: new Date(),
  };

  const handleRegister = useCallback(
    async (values: RegisterFormType) => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Registration failed");
        }
        const data = await response.json();
        await createAuthCookie(data.token);
        router.replace("/");
      } catch (err: any) {
        setError(
          err.message ? err.message.toString() : "An unknown error occurred",
        );
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
      <div className="mb-6 font-bold text-center text-[25px]">Register</div>

      <Stepper currentStep={currentStep} steps={steps} goToStep={goToStep} />

      <Formik
        initialValues={initialValues}
        validationSchema={RegisterSchema}
        onSubmit={handleRegister}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <>
            {currentStep === 0 && (
              <div className="flex flex-col gap-4 mb-4 w-1/2">
                <div className="flex flex-row gap-4">
                  <Input
                    variant="bordered"
                    label="Name"
                    value={values.name}
                    isInvalid={!!errors.name && !!touched.name}
                    errorMessage={errors.name}
                    onChange={handleChange("name")}
                    required
                  />
                  <Input
                    variant="bordered"
                    label="Surname"
                    value={values.surname}
                    isInvalid={!!errors.surname && !!touched.surname}
                    errorMessage={errors.surname}
                    onChange={handleChange("surname")}
                    required
                  />
                </div>
                <Input
                  variant="bordered"
                  label="Username"
                  value={values.username}
                  isInvalid={!!errors.username && !!touched.username}
                  errorMessage={errors.username}
                  onChange={handleChange("username")}
                  required
                />
                <Input
                  variant="bordered"
                  label="Email"
                  type="email"
                  value={values.email}
                  isInvalid={!!errors.email && !!touched.email}
                  errorMessage={errors.email}
                  onChange={handleChange("email")}
                  required
                />
              </div>
            )}
            {currentStep === 1 && (
              <div className="flex flex-col gap-4 mb-4 w-1/2">
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
                  type="Date"
                  value={
                    values.birthDate instanceof Date
                      ? values.birthDate.toISOString().split("T")[0]
                      : values.birthDate
                  }
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
              <div className="flex flex-col gap-4 mb-4 w-1/2">
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
              <div className="mt-4 text-sm font-bold text-red-500">{error}</div>
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

      <div className="mt-4 text-sm font-light text-slate-400">
        <Button variant="flat" color="secondary" as={Link} href="/login">
          Already have an account? <b>Login</b>
        </Button>
      </div>
    </>
  );
};
