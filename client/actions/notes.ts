import { NoteModel } from "../helpers/types";
const NOTES_API_URL = "/api/notes";

export const fetchNotes = async (): Promise<NoteModel[]> => {
  try {
    const response = await fetch(
      `${NOTES_API_URL}/list?fields=_id,title,date,tags,content`,
    );
    if (response.ok) {
      const data = await response.json();
      // Sort notes by date in descending order
      return data.sort(
        (a: NoteModel, b: NoteModel) =>
          new Date(b.date!).getTime() - new Date(a.date!).getTime(),
      );
    } else {
      console.error("Failed to fetch notes");
      return [];
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
};

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
