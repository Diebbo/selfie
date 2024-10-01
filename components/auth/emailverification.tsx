'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import getBaseUrl from '@/config/proxy';

export function EmailVerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<string>('Verifica in corso...');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailToken = searchParams?.get('emailToken');
    if (emailToken) {
      handleVerification(emailToken);
    }
  }, [searchParams]);

  const handleVerification = async (emailToken: string) => {
    const path = `${getBaseUrl()}/api/auth/verifyemail?emailToken=${emailToken}`;

    try {
      const res = await fetch(path, {
        method: 'PATCH',
      });

      if (!res.ok) {
        setVerificationStatus('Verifica email fallita. Token non valido.');
        return;
      }

      setVerificationStatus('Verifica email riuscita! Clicca qui per andare alla pagina di login.');
      setIsVerified(true);
    } catch (error) {
      setVerificationStatus('Verifica email fallita. Si è verificato un errore.');
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="container mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Verifica Email</h1>
      <p className={`text-lg ${verificationStatus.includes('riuscita') ? 'text-green-600' : 'text-red-600'}`}>
        {verificationStatus}
      </p>
      {isVerified && (
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
