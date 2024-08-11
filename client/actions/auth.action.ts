"use server";

import { LoginFormType, RegisterType } from "@/helpers/types";
import { cookies } from "next/headers";
import getBaseUrl  from "@/config/proxy";

export const createAuthCookie = async (token: string) => {
	cookies().set("token", token, { secure: true });
};

export const deleteAuthCookie = async () => {
	cookies().delete("token");
};
// Purpose: Handles the login process.
export async function login(user: LoginFormType) {
	const response = await fetch(`${getBaseUrl()}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(user),
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Login failed");
	}

	return response.json();
}

export async function register(user: RegisterType) {
	const response = await fetch(`${getBaseUrl()}/register`, {
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
