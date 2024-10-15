"use server";
const NOTES_API_URL = "/api/notes";
import { cookies } from "next/headers";
import getBaseUrl from "@/config/proxy";
import { AuthenticationError, ServerError } from "@/helpers/errors";
import { NoteModel } from "@/helpers/types";

export async function getNotes() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(
    `${getBaseUrl()}/api/notes/list?fields=_id,title,date,tags,content`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token.toString()}`,
      },
      cache: "no-store", // This ensures fresh data on every request
    },
  );

  if (res.status === 401) {
    throw new AuthenticationError("Unauthorized, please login.");
  } else if (res.status >= 500) {
    throw new ServerError(`Server error: ${res.statusText}`);
  } else if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await res.json();
  return data.sort(
    (a: NoteModel, b: NoteModel) =>
      new Date(b.date!).getTime() - new Date(a.date!).getTime(),
  );
}

export const fetchNoteById = async (id: string): Promise<NoteModel | null> => {
  try {
    const response = await fetch(`${NOTES_API_URL}/${id}`);
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
  noteId?: string,
): Promise<boolean> => {
  try {
    let response;
    if (noteId) {
      // Aggiornamento di una nota esistente
      response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note: { ...note, _id: noteId } }),
      });
    } else {
      // Creazione di una nuova nota
      response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
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
