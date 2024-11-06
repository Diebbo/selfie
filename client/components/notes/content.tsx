"use client";

import React, { useState, useEffect } from "react";
import { NoteModel } from "@/helpers/types";
import { getNotes } from "@/actions/notes";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { NoteEditor } from "./NoteEditor";
import NotesSidebar from "./NotesSidebar";
import NotesList from "./NotesList";

interface NotePageProps {
  notes: NoteModel[];
}

const NotePage: React.FC<NotePageProps> = (props) => {
  const [notes, setNotes] = useState<NoteModel[]>(props.notes);

  const [noteState, setNoteState] = useState({
    selectedNote: null as NoteModel | null,
    title: "",
    content: "",
    tags: "",
    showMarkdown: false,
  });
  const [uiState, setUiState] = useState({
    searchQuery: "",
    showNoteList: false,
    showNoteForm: window.innerWidth >= 768, // Show form by default on desktop
    isMobileView: window.innerWidth < 768,
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    const noteId = searchParams.get("id");
    const newNote = searchParams.has("new");
    const listNote = searchParams.has("list");
  
    if (noteId) {
      const foundNote = notes.find(note => note._id === noteId);
      if (foundNote) {
        setNoteState({
          selectedNote: foundNote,
          title: foundNote.title,
          content: foundNote.content,
          tags: foundNote.tags.join(", "),
          showMarkdown: false,
        });
        setUiState(prev => ({
          ...prev,
          showNoteList: false,
          showNoteForm: true,
        }));
      }
    } else if (newNote) {
      setUiState(prev => ({
        ...prev,
        showNoteList: false,
        showNoteForm: true,
      }));
      setNoteState({
        selectedNote: null,
        title: "",
        content: "",
        tags: "",
        showMarkdown: false,
      });
    } else if (listNote) {
      setUiState(prev => ({
        ...prev,
        showNoteList: true,
        showNoteForm: false,
      }));
    } else {
      setUiState(prev => ({
        ...prev,
        showNoteList: false,
        showNoteForm: !prev.isMobileView,
      }));
    }
  }, [searchParams, notes]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setUiState(prev => ({
        ...prev,
        isMobileView: isMobileView,
      }));
    };

    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


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
    setUiState((prev) => ({
      ...prev,
      searchQuery: e.target.value
    }));
  };

  const handleSave = async () => {
    const note: NoteModel = {
      title: noteState.title,
      content: noteState.content,
      tags: noteState.tags.split(",").map((tag) => tag.trim()),
    };

    const success = await saveNote(note, noteState.selectedNote?._id);
    if (success) {
    
      const updatedNotes = await getNotes();
      setNotes(updatedNotes);

      toast(
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">{"✅ Nota salvata"}</h4>
          </div>
        </div>,
        {
          duration: 2000  ,
          position: 'top-right',
        }
      );

      if (uiState.isMobileView) {
        setUiState((prev) => ({
          ...prev,
          showNoteList: true,
          showNoteForm: false,
        }));
      }
    } else {
      toast(
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">{"❌ Errore durante il salvataggio"}</h4>
          </div>
        </div>,
        {
          duration: 2000  ,
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
      setNoteState({
        selectedNote: null,
        title: "",
        content: "",
        tags: "",
        showMarkdown: false,
      }); 
      toast(
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">{"✅ Nota eliminata"}</h4>
          </div>
        </div>,
        {
          duration: 2000  ,
          position: 'top-right',
        }
      );
    }
  };

  const handleNewNote = () => {
    window.history.pushState(null, "", `?new`);
    setUiState({
      searchQuery: "",
      showNoteList: false,
      showNoteForm: true,
      isMobileView: uiState.isMobileView,
    });
  };

  const handleShowNoteList = () => {
    window.history.pushState(null, "", `?list`);
    setUiState({
      searchQuery: "",
      showNoteList: true,
      showNoteForm: false,
      isMobileView: uiState.isMobileView,
    });
  };

  const handleIndietro = () => {
    window.history.pushState(null, "", "?");
  };

  const handleCardClick = (note: NoteModel) => {
    window.history.pushState(null, "", `?id=${note._id}`);
  };

  return (
    <div className="flex" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Sidebar */}
      {(!uiState.isMobileView ||
        (!uiState.showNoteList && !uiState.showNoteForm)) && (
        <div className={`${uiState.isMobileView ? "w-full" : "w-64"} overflow-scroll`}>
          <NotesSidebar
            notes={notes}
            searchQuery={uiState.searchQuery}
            onSearch={handleSearchChange}
            onShowNoteList={handleShowNoteList}
            onNewNote={handleNewNote}
            onNoteSelect={handleCardClick}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Right panel */}
      {(!uiState.isMobileView ||
        uiState.showNoteList ||
        uiState.showNoteForm) && (
        <div className={`${uiState.isMobileView ? "w-full" : "flex-1"} p-4 overflow-scroll`}>
          {uiState.showNoteList ? (
            <NotesList
              notes={notes}
              onNoteClick={handleCardClick}
              onDelete={handleDelete}
              isMobileView={uiState.isMobileView}
              onBack={handleIndietro}
            />
          ) : uiState.showNoteForm ? (
            <NoteEditor
              {...noteState}
              onTitleChange={(title) => setNoteState((s) => ({ ...s, title }))}
              onContentChange={(content) =>
                setNoteState((s) => ({ ...s, content }))
              }
              onTagsChange={(tags) => setNoteState((s) => ({ ...s, tags }))}
              onSave={handleSave}
              onToggleMarkdown={() =>
                setNoteState((s) => ({ ...s, showMarkdown: !s.showMarkdown }))
              }
              onBack={handleIndietro}
              isEditing={!!noteState.selectedNote}
              isMobileView={uiState.isMobileView}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default NotePage;
