"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { deleteAuthCookie } from "@/actions/auth.action";
import { Input, Button } from "@nextui-org/react";

export function ResetPass() {
  const [verificationStatus, setVerificationStatus] = useState<string>(
    "Verifica in corso...",
  );
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

  const searchParams = useSearchParams();
  const resetToken = searchParams.get("resetToken");
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibilityConfirm = () => setIsVisibleConfirm(!isVisibleConfirm);

  const verifyResetToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify-reset-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resetToken: token }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsTokenValid(true);
        setVerificationStatus(
          "Token verificato. Puoi procedere con il reset della password.",
        );
      } else {
        setVerificationStatus("Token non valido o scaduto.");
        setIsTokenValid(false);
      }
    } catch (error) {
      setVerificationStatus("Errore durante la verifica del token.");
      setIsTokenValid(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (password.length < 8) {
      setError("La password deve essere di almeno 8 caratteri");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resetToken: resetToken, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        setError("");
        setVerificationStatus("Password cambiata con successo!");
      } else {
        setError(data.message || "Errore durante il reset della password");
      }
    } catch (error) {
      setError("Errore durante il reset della password");
    }
  };

  useEffect(() => {
    if (resetToken) {
      verifyResetToken(resetToken);
    } else {
      setVerificationStatus("Token non presente nella richiesta");
    }
  }, [resetToken]);

  const handleLoginRedirect = async () => {
    await deleteAuthCookie();
    router.push("/login");
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>

      <div className="max-w-md mx-auto">
        <p
          className={`text-lg mb-4 text-center ${
            verificationStatus.includes("successo")
              ? "text-green-600"
              : verificationStatus.includes("Token verificato")
                ? "text-green-600"
                : "text-red-600"
          }`}
        >
          {verificationStatus}
        </p>

        {isTokenValid && !resetSuccess && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="Nuova Password"
              variant="bordered"
              placeholder="Inserisci la nuova password"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                ></button>
              }
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="max-w-full"
            />

            <Input
              label="Conferma Password"
              variant="bordered"
              placeholder="Conferma la nuova password"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibilityConfirm}
                ></button>
              }
              type={isVisibleConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="max-w-full"
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button type="submit" color="primary" className="w-full">
              Reset Password
            </Button>
          </form>
        )}

        {resetSuccess && (
          <Button
            color="success"
            onClick={handleLoginRedirect}
            className="w-full mt-4"
          >
            Vai alla pagina di login
          </Button>
        )}
      </div>
    </div>
  );
}

export default ResetPass;
