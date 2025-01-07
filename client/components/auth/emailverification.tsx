"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { deleteAuthCookie, verification } from "@/actions/auth.action";

export function EmailVerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<string>(
    "Verifica in corso..."
  );
  const searchParams = useSearchParams();
  const emailToken = searchParams.get("emailToken");
  const router = useRouter();

  const handleVerification = async (email: string) => {
    const res = await verification(email);
    setVerificationStatus(res.message);
  };

  useEffect(() => {
    const verifyEmail = async () => {
      if (emailToken) {
        await handleVerification(emailToken);
      } else {
        setVerificationStatus("Token non inserito");
      }
    };
    verifyEmail();
  }, [emailToken]);

  const handleLoginRedirect = async () => {
    await deleteAuthCookie();
    router.push("/login");
  };

  return (
    <div className="container mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Verifica Email</h1>
      <p
        className={`text-lg ${
          verificationStatus.includes("verified")
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {verificationStatus}
      </p>
      {verificationStatus.includes("verified") && (
        <button
          onClick={handleLoginRedirect}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Vai alla pagina di login
        </button>
      )}
    </div>
  );
}

export default EmailVerificationPage;
