import React from "react";
import { EmailVerificationPage } from "@/components/auth/emailverification";
import { Suspense } from "react";

const verification = () => {
  return (
    <Suspense>
      <EmailVerificationPage />
    </Suspense>
  );
};

export default verification;
