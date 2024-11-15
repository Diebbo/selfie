"use client";

import { createAuthCookie } from "@/actions/auth.action";
import { LoginSchema } from "@/helpers/schemas";
import { LoginFormType } from "@/helpers/types";
import { Button, Input } from "@nextui-org/react";
import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { login } from "@/actions/auth.action";
import { useState } from "react";
import { MailIcon } from "./MailIcon";
import { PassLockIcon } from "./PassLockIcon";
import { useSearchParams } from "next/navigation";

export const Login = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  const handleLogin = useCallback(
    async (values: LoginFormType) => {
      try {
        const response = await login(values);
        // We need this to show the error message in the login page from the server action
        if (response instanceof Error) {
          throw response;
        }
        await createAuthCookie(response.token);
        router.replace(redirect || "/");
      } catch (err: any) {
        setError(
          err.message ? err.message.toString() : "An unknown error occurred",
        );
      }
    },
    [router],
  );

  return (
    <>
      <div className="text-center text-[25px] font-bold mb-6">Login</div>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
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
              <Input
                variant="bordered"
                label="Password"
                type="password"
                value={values.password}
                endContent={<PassLockIcon />}
                isInvalid={!!errors.password && !!touched.password}
                errorMessage={errors.password}
                onChange={handleChange("password")}
              />
            </div>
            <div className="flex justify-center mb-4">
              <Link
                href="/lost-password"
                className="text-sm text-slate-400 hover:text-blue-300 font-light"
              >
                Password dimenticata?
              </Link>
            </div>
            <div className="flex justify-center flex-wrap flex-row gap-4">
              <Button type="submit" variant="flat" color="primary">
                Login
              </Button>
              <Button variant="flat" color="success" as={Link} href="/register">
                Register
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      {error && (
        <div className="font-bold mt-4 text-sm text-red-500">{error}</div>
      )}
    </>
  );
};
