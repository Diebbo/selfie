"use client";

import React, { useState, useEffect } from "react";
import { NoteModel } from "@/helpers/types";
import NoteCard from "@/components/notes/NoteCard";
import Markdown from "react-markdown";
import { getNoteById, getNotes } from "@/actions/notes";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface NotePageProps {
  notes: NoteModel[];
}

const NotePage: React.FC<NotePageProps> = (props) => {
  const [notes, setNotes] = useState<NoteModel[]>(props.notes);
  const [selectedNote, setSelectedNote] = useState<NoteModel | null>(null); // Nota selezionata da mostrare nel form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(300); // Initial width of the left panel
  const [isResizing, setIsResizing] = useState(false);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialPanelWidth, setInitialPanelWidth] = useState(300);
  const [showNoteList, setShowNoteList] = useState(false); // Stato per mostrare le note sotto forma di card
  const [showNotification, setShowNotification] = useState(false); // State for notification
  const [isMobileView, setIsMobileView] = useState(false); // State for mobile view
  const [showNoteForm, setShowNoteForm] = useState(false); // State for showing the note form
  const [showMarkdown, setShowMarkdown] = useState(false);
  const router = useRouter();

  /*const fetchNotes = async () => {
    const res = await fetch(
      `/api/notes/list?fields=_id,title,date,tags,content`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // This ensures fresh data on every request
      },
    );

    const notes = await res.json();
    return notes.sort(
      (a: NoteModel, b: NoteModel) =>
        new Date(b.date!).getTime() - new Date(a.date!).getTime(),
    );
  };*/

  const searchParams = useSearchParams();

useEffect(() => {
  const noteId = searchParams.get('id');
  const newNote = searchParams.has('new');
  const listNote = searchParams.has('list');
  if (noteId) {
    fetchNoteById(noteId).then((fetchedNote) => {
      if (fetchedNote) {
        setSelectedNote(fetchedNote);
        setTitle(fetchedNote.title);
        setContent(fetchedNote.content);
        setTags(fetchedNote.tags.join(", "));
        setShowNoteForm(true);
        setShowNoteList(false);
      }
    });
  }
  else if (newNote) {
    console.log("newNote")
    setShowNoteForm(true);
    setShowNoteList(false);
  }
  else if (listNote) {
    setShowNoteList(true);
    setShowNoteForm(false);
  }
  else{
    console.log("else")
    setShowNoteList(false);
    setShowNoteForm(false);
  }
  
}, [searchParams]);

  const fetchNoteById = async (id: string) => {

    // TODO: Decide whether to use fetch or server actions
    /*const res = await fetch(`/api/notes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // This ensures fresh data on every request
    });*/
    const note = await getNoteById(id); 
    return note;
  };

  const saveNote = async (note: NoteModel, id?: string) => {
    console.log(id);
    const res = await fetch(`/api/notes/${id ? id : ""}`, {
      method: id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });
    return res.ok;
  };

  const deleteNote = async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.ok;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = initialPanelWidth + (e.clientX - initialMouseX);
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = ""; // Re-enable text selection
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none"; // Disable text selection
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, initialMouseX, initialPanelWidth]);



  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  

  const handleSave = async () => {
    const note: NoteModel = {
      title,
      content,
      tags: tags.split(",").map((tag) => tag.trim()),
    };

    console.log(selectedNote?._id);

    const success = await saveNote(note, selectedNote?._id);
    if (success) {
      setTitle("");
      setContent("");
      setTags("");
      setSelectedNote(null);
      const notes = await getNotes();
      setNotes(notes);
      toast(
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">{"✅ Nota salvata con successo"}</h4>          </div>
        </div>,
        {
          duration: 5000  ,
          position: 'top-right',
        }
      );
      if (isMobileView) setShowNoteList(true); // Show note list after saving on mobile
    }
    else {
      toast(
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">{"❌ Errore nel salvataggio della nota"}</h4>
          </div>
        </div>,
        {
          duration: 5000  ,
          position: 'top-right',
        }
      );
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    const success = await deleteNote(id);
    if (success) {
      setNotes(notes.filter((note) => note._id !== id));
    }
  };

  const handleNewNote = () => {
    window.history.pushState(null, "", `?new`);
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setTags("");
    //setShowNoteForm(true);
    //setShowNoteList(false); // Hide note list when creating a new note
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setInitialMouseX(e.clientX);
    setInitialPanelWidth(leftPanelWidth);
  };

  const handleShowNoteList = () => {
    window.history.pushState(null, "", `?list`);
    setSelectedNote(null);
  };

  const handleIndietro = () => {
    window.history.pushState(null, "", "?");
  };

  const handleCardClick = (note: NoteModel) => {
    window.history.pushState(null, "", `?id=${note._id}`);
    /*setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(", "));
    setShowNoteForm(true);
    setShowNoteList(false); // Hide note list when a note is selected*/
  };

  return (
    <div className="flex h-screen">
      <div
        className={`bg-gray-100 dark:bg-gray-900 p-4 overflow-y-auto ${
          isMobileView && (showNoteList || showNoteForm) ? "hidden" : ""
        }`}
        style={{ width: isMobileView ? "100%" : leftPanelWidth }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Le tue note
        </h2>
        <div className="flex mb-4">
          <button
            onClick={handleNewNote}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
          >
            Nuova Nota
          </button>
          <button
            onClick={handleShowNoteList}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Lista Note
          </button>
        </div>
        <input
          type="text"
          placeholder="Cerca note..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full mb-4 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <ul>
          {notes
            .filter(
              (note) =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.tags.some((tag: string) =>
                  tag.toLowerCase().includes(searchQuery.toLowerCase()),
                ),
            )
            .map((note) => (
              <li
                key={note._id}
                className="mb-2 flex justify-between items-center group"
              >
                <span
                  className="cursor-pointer hover:text-blue-500 text-gray-900 dark:text-gray-100"
                  onClick={() => {
                    if (note._id) {
                      window.history.pushState(null, "", `?id=${note._id}`);
                    }
                  }}
                >
                  {note.title}
                </span>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  🗑️
                </button>
              </li>
            ))}
        </ul>
      </div>
      <div
        className={`resizer w-2 bg-gray-300 cursor-col-resize ${
          isMobileView ? "hidden" : ""
        }`}
        onMouseDown={handleMouseDown}
      />
      <div
        className={`w-full p-4 ${isMobileView && !showNoteForm && !showNoteList ? "hidden" : ""}`}
      >
        {isMobileView && (
          <button
            onClick={handleIndietro}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4"
          >
            Indietro
          </button>
        )}
        {showNoteList ? (
          notes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onClick={handleCardClick}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p className="text-xl font-medium mb-2">Nessuna nota disponibile</p>
              <p className="text-sm">Clicca su "Nuova Nota" per iniziare</p>
            </div>
          )
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">
              {selectedNote ? "Modifica Nota" : "Crea una nuova nota"}
            </h1>
            <input
              type="text"
              placeholder="Titolo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            />
            <textarea
              placeholder="Contenuto"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full mb-4 p-2 border rounded h-40"
            />
            <input
              type="text"
              placeholder="Tag (separati da virgola)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            />
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {selectedNote ? "Aggiorna Nota" : "Salva Nota"}
            </button>
            <button
              onClick={() => setShowMarkdown(!showMarkdown)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ml-2"
            >
              {showMarkdown ? "Edit View" : "Markdown View"}
            </button>

            {showMarkdown ? (
              <div className="mt-4 p-2 border rounded prose dark:prose-invert prose-headings:mb-1 prose-headings:mt-3 dark:prose-pre:bg-gray-600">
                <Markdown>{content}</Markdown>
              </div>
            ) : null}
          </>
        )}
      </div>
      
    </div>
  );
};

export default NotePage;
