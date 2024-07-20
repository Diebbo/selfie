// Purpose: Handles the login process.

// Purpose: Handles the login process.
export async function login(username: string, password: string) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
		credentials: 'include',
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}
