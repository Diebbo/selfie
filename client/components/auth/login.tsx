"use client";

import { createAuthCookie } from "@/actions/auth.action";
import { LoginSchema } from "@/helpers/schemas";
import { LoginFormType } from "@/helpers/types";
import { Button, Input } from "@nextui-org/react";
import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { login } from "@/actions/auth.action";
import { useState } from "react";
import { MailIcon } from "./MailIcon";
import { PassLockIcon } from "./PassLockIcon";

export const Login = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const initialValues: LoginFormType = {
    email: "die.barbieri03@gmail.com",
    password: "",
  };

  const handleLogin = useCallback(
    async (values: LoginFormType) => {
      try {
        const response = await login(values);
        // We need this to show the error message in the login page from the server action
        if (response?.success === false) {
          setError(response.message);
          return;
        }
        await createAuthCookie(response.token);
        router.replace("/");
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
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <>
            <div className="flex flex-col w-1/2 gap-4 mb-4">
              <Input
                variant="bordered"
                label="Email"
                type="email"
                value={values.email}
                endContent=<MailIcon />
                isInvalid={!!errors.email && !!touched.email}
                errorMessage={errors.email}
                onChange={handleChange("email")}
              />
              <Input
                variant="bordered"
                label="Password"
                type="password"
                value={values.password}
                endContent=<PassLockIcon />
                isInvalid={!!errors.password && !!touched.password}
                errorMessage={errors.password}
                onChange={handleChange("password")}
              />
            </div>

            <Button
              onPress={() => handleSubmit()}
              variant="flat"
              color="primary"
            >
              Login
            </Button>
          </>
        )}
      </Formik>

      {error && (
        <div className="font-bold text-slate-400 mt-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="font-light text-slate-400 mt-4 text-sm">
        Don&apos;t have an account ?{" "}
        <Link href="/register" className="font-bold">
          Register here
        </Link>
      </div>

      <div className="font-light text-slate-400 mt-4 text-sm">
        <Link href="/forgot-password" className="font-bold">
          Forgot password ?
        </Link>
      </div>
    </>
  );
};
