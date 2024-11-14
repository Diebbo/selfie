"use server";
const NOTES_API_URL = "/api/notes";
import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { AuthenticationError, ServerError } from "@/helpers/errors";
import { NoteModel } from "@/helpers/types";

export async function getNotes() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${getBaseUrl()}/api/notes/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.toString()}`,
    },
    cache: "no-store", // This ensures fresh data on every request
  });

  if (res.status === 401) {
    throw new AuthenticationError("Unauthorized, please login.");
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error("Failed to fetch notes");
  }

  const data = await res.json();
  const publicNotes = data.public.map((note: NoteModel) => ({
    ...note,
    isPublic: true,
  }));

  // Lascia le note private come sono
  const privateNotes = data.private;

  // Combina le note e ordina per data
  const allNotes = [...publicNotes, ...privateNotes].sort(
    (a: NoteModel, b: NoteModel) =>
      new Date(b.date!).getTime() - new Date(a.date!).getTime(),
  );

  return allNotes;
}

export const getNoteById = async (id: string): Promise<NoteModel | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(`${getBaseUrl()}/api/notes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token.toString()}`,
      },
      cache: "no-store", // This ensures fresh data on every request
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch note");
      return null;
    }
  } catch (error) {
    console.error("Error fetching note:", error);
    return null;
  }
};

export const saveNote = async (
  note: NoteModel,
  publicNote: boolean,
  noteId?: string,
): Promise<boolean> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      throw new Error("Not authenticated");
    }
    let response;
    if (noteId) {
      // Aggiornamento di una nota esistente
      response = await fetch(`${getBaseUrl()}/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token.toString()}`,
        },
        body: JSON.stringify({
          ...note,
          _id: noteId,
          isPublic: publicNote,
        }),
      });
    } else {
      // Creazione di una nuova nota
      response = await fetch(`${getBaseUrl()}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token.toString()}`,
        },
        body: JSON.stringify({
          ...note,
          isPublic: publicNote,
        }),
      });
    }

    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json();
      console.error("Failed to save note:", errorData.message);
      return false;
    }
  } catch (error) {
    console.error("Error saving note:", error);
    return false;
  }
};

export const deleteNote = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${NOTES_API_URL}/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      return true;
    } else {
      console.error("Failed to delete note");
      return false;
    }
  } catch (error) {
    console.error("Error deleting note:", error);
    return false;
  }
};
