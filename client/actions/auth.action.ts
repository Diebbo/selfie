"use server";

import { LoginFormType, RegisterType } from "@/helpers/types";
import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";

export const createAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
};

export const deleteAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("token");
};

// Purpose: Handles the login process.
export async function login(user: LoginFormType) {
  const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    // WE need this to show the error message in the login page
    // Doesn't work with throw new Error in production 
    if (response.status === 401) {
      const err = {
        message: error.message,
        success: false,
      }
      return err;
    }
    throw new Error(error.message || "Login failed");
  }

  return await response.json();
}

export async function register(user: RegisterType) {
  const response = await fetch(`${getBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  return response.json();
}

export async function verification(emailToken: string) {
  const response = await fetch(
    `${getBaseUrl()}/api/auth/verifyemail?emailToken=${emailToken}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return await response.json();
}

export async function isVerified() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return false;
  }

  const response = await fetch(`${getBaseUrl()}/api/auth/isVerified`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    credentials: "include",
  });

  return response.status;
}

export async function getEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return false;
  }

  const response = await fetch(`${getBaseUrl()}/api/auth/email`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Verification failed");
  }

  return await response.json();
}

// Funzione che mi ritorna username dell'utente
export async function getUsername() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return false;
  }

  const response = await fetch(`${getBaseUrl()}/api/auth/username`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Verification failed");
  }

  return await response.json();
}

export async function getNotificationStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getBaseUrl()}/api/auth/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Verification failed");
  }

  const data = await response.json();
  const result = {
    emailOn: data.emailOn,
    pushOn: data.pushOn,
  };

  return result;
}
