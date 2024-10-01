"use client";

import React, { useState, useEffect } from "react";
import {
  fetchNotes,
  fetchNoteById,
  saveNote,
  deleteNote,
} from "@/actions/notes";
import NoteCard from "@/components/notes/NoteCard";
import { NoteModel } from "@/helpers/types";

const NotePage: React.FC = () => {
  const [notes, setNotes] = useState<NoteModel[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteModel | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(300); // Initial width of the left panel
  const [isResizing, setIsResizing] = useState(false);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialPanelWidth, setInitialPanelWidth] = useState(300);
  const [showNoteList, setShowNoteList] = useState(false); // New state for showing NoteModel list
  const [showNotification, setShowNotification] = useState(false); // State for notification

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fetchAllNotes = async () => {
      const notes = await fetchNotes();
      setNotes(notes);
    };
    fetchAllNotes();
  }, []);

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

  const handleSave = async () => {
    const NoteModel = {
      title,
      content,
      tags: tags.split(",").map((tag) => tag.trim()),
    };

    const success = await saveNote(NoteModel, selectedNote?._id);
    if (success) {
      setTitle("");
      setContent("");
      setTags("");
      setSelectedNote(null);
      const notes = await fetchNotes();
      setNotes(notes);
      setShowNotification(true); // Show notification
      setTimeout(() => setShowNotification(false), 3000); // Hide notification after 3 seconds
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    const success = await deleteNote(id);
    if (success) {
      setNotes(notes.filter((NoteModel) => NoteModel._id !== id));
    }
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setTags("");
    setShowNoteList(false); // Hide NoteModel list when creating a new NoteModel
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setInitialMouseX(e.clientX);
    setInitialPanelWidth(leftPanelWidth);
  };

  const handleShowNoteList = () => {
    setShowNoteList(true);
    setSelectedNote(null);
  };

  const handleCardClick = (NoteModel: NoteModel) => {
    setSelectedNote(NoteModel);
    setTitle(NoteModel.title);
    setContent(NoteModel.content);
    setTags(NoteModel.tags.join(", "));
    setShowNoteList(false); // Hide NoteModel list when a NoteModel is selected
  };

  return (
    <div className="flex h-screen">
      {showNotification && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          Nota salvata correttamente
          <div className="h-1 bg-green-700 mt-2 relative">
            <div
              className="absolute top-0 left-0 h-full bg-green-300"
              style={{ animation: "progress 3s linear" }}
            />
          </div>
        </div>
      )}
      <div
        className="bg-gray-100 dark:bg-gray-900 p-4 overflow-y-auto"
        style={{ width: leftPanelWidth }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Le tue NoteModel
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
            Lista NoteModel
          </button>
        </div>
        <input
          type="text"
          placeholder="Cerca NoteModel..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full mb-4 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <ul>
          {notes
            .filter(
              (NoteModel) =>
                NoteModel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                NoteModel.tags.some((tag) =>
                  tag.toLowerCase().includes(searchQuery.toLowerCase()),
                ),
            )
            .map((NoteModel) => (
              <li
                key={NoteModel._id}
                className="mb-2 flex justify-between items-center group"
              >
                <span
                  className="cursor-pointer hover:text-blue-500 text-gray-900 dark:text-gray-100"
                  onClick={() => {
                    if (NoteModel._id) {
                      fetchNoteById(NoteModel._id).then((fetchedNote) => {
                        if (fetchedNote) {
                          setSelectedNote(fetchedNote);
                          setTitle(fetchedNote.title);
                          setContent(fetchedNote.content);
                          setTags(fetchedNote.tags.join(", "));
                          setShowNoteList(false); // Hide NoteModel list when a NoteModel is selected from the sidebar
                        }
                      });
                    }
                  }}
                >
                  {NoteModel.title}
                </span>
                <button
                  onClick={() => handleDelete(NoteModel._id)}
                  className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  🗑️
                </button>
              </li>
            ))}
        </ul>
      </div>
      <div
        className="resizer w-2 bg-gray-300 cursor-col-resize"
        onMouseDown={handleMouseDown}
      />
      <div className="w-full p-4">
        {showNoteList ? (
          <div className="grid grid-cols-3 gap-4">
            {notes.map((NoteModel) => (
              <NoteCard
                key={NoteModel._id}
                note={NoteModel}
                onClick={handleCardClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
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
          </>
        )}
      </div>
      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default NotePage;
