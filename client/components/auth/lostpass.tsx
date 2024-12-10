"use client";
import { Button, Input } from "@nextui-org/react";
import { Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";
import { MailIcon } from "./MailIcon";

import * as Yup from "yup";

export const LostPassSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});
export type LostPassFormType = {
  email: string;
};

export const LostPass = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLostPass = async (values: LostPassFormType) => {
    try {
      const response = await fetch("/api/auth/lostpass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "An error occurred");
        setSuccess(null);
        return;
      }

      setSuccess("Password reset instructions have been sent to your email");
      setError(null);
    } catch (err: any) {
      setError(
        err.message ? err.message.toString() : "An unknown error occurred",
      );
      setSuccess(null);
    }
  };

  return (
    <>
      <div className="text-center text-[25px] font-bold mb-6">
        Reset Password
      </div>

      <Formik
        initialValues={{ email: "" }}
        validationSchema={LostPassSchema}
        onSubmit={handleLostPass}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <Form className="w-full">
            <div className="flex w-1/2 flex-col gap-4 mb-4 mx-auto">
              <Input
                variant="bordered"
                label="Email"
                type="email"
                value={values.email}
                endContent={<MailIcon />}
                isInvalid={!!errors.email && !!touched.email}
                errorMessage={errors.email}
                onChange={handleChange("email")}
              />
            </div>
            <div className="flex justify-center flex-wrap flex-row gap-4">
              <Button type="submit" variant="flat" color="primary">
                Reset Password
              </Button>
              <Button variant="flat" color="default" as={Link} href="/login">
                Back to Login
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      {error && (
        <div className="font-bold mt-4 text-sm text-red-500">{error}</div>
      )}
      {success && (
        <div className="font-bold mt-4 text-sm text-green-500">{success}</div>
      )}
    </>
  );
};
