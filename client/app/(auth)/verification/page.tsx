import React from "react";
import { EmailVerificationPage } from "@/components/auth/emailverification";
import { Suspense } from "react";

const verification = () => {
  
    return (
    <Suspense fallback={<div>Loading...</div>}>;
      <EmailVerificationPage />;
    </Suspense>
   );
  
};

export default verification;
