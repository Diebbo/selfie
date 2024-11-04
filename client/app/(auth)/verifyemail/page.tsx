"use client";
import React from "react";
import Link from "next/link";
import { deleteAuthCookie } from "@/actions/auth.action";

const VerifyEmailPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">
          Verify Your Account
        </h1>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Please check your email to verify your account.
        </p>
        <Link
          href="/login"
          onClick={async () => {
            await deleteAuthCookie();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Login Page
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
