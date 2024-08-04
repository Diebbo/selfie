// Purpose: Handles the login process.
import { Login, Register } from "../../models/auth/register";

// Purpose: Handles the login process.
export async function login(user: Login) {
	const response = await fetch("/api/login", {
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

export async function register(user: Register) {
	const response = await fetch("/api/register", {
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
