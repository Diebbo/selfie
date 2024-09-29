"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { deleteAuthCookie } from '@/actions/auth.action';
import getBaseUrl from '@/config/proxy';

export function EmailVerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<string>('Verifica in corso...');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const emailToken = searchParams.get('emailToken');
  const router = useRouter();

  const handleVerification = () => {
    const path = `${getBaseUrl()}/api/auth/verifyemail?emailToken=${emailToken}`;

    fetch(path, {
      method: 'PATCH',
    }).then((res) => {
      if (!res.ok) {
        setVerificationStatus('Verifica email fallita. Token non valido.');
        return;
      }
      setVerificationStatus('Verifica email riuscita! Clicca qui per andare alla pagina di login.');
      setIsVerified(true);
    }).catch(() => {
      setVerificationStatus('Verifica email fallita. Token non valido.');
    });
  }

  useEffect(() => {
    if (emailToken) {
      handleVerification();
    }
  }, [emailToken]);


  const handleLoginRedirect = async () => {
    await deleteAuthCookie();
    router.push('/login');
  };

  return (
    <div className="container mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Verifica Email</h1>
      <p className={`text-lg ${verificationStatus.includes('riuscita') ? 'text-green-600' : 'text-red-600'}`}>
        {verificationStatus}
      </p>
      {verificationStatus.includes('riuscita') && (
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
