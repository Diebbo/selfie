import { NoteModel } from "@/helpers/types";
import { Button, Select, SelectItem } from "@nextui-org/react";
import { useState } from "react";

interface NotesSidebarProps {
  notes: NoteModel[];
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewNote: () => void;
  onShowNoteList: () => void;
  onNoteSelect: (note: NoteModel) => void;
  onDuplicate: (note: NoteModel) => void;
  onDelete: (id: string) => void;
  showPublic: boolean;
  onTogglePublic: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({
  notes,
  searchQuery,
  onSearch,
  onNewNote,
  onShowNoteList,
  onNoteSelect,
  onDuplicate,
  onDelete,
  showPublic,
  onTogglePublic,
  sortBy,
  onSortChange,
}) => {
  // Filtra prima per pubblico/privato, poi per la ricerca
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
        <h2 className="text-xl font-bold">Le tue note</h2>
        <div className="grid gap-2 grid-cols-2">
          <Button
            onClick={onNewNote}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Nuova Nota
          </Button>
          <Button
            onClick={onShowNoteList}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Lista Note
          </Button>
          <Button
            onClick={onTogglePublic}
            className={`px-4 py-2 rounded transition-colors ${
              showPublic
                ? "bg-green-500 hover:bg-green-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white`}
          >
            {showPublic ? "Pubbliche" : "Private"}
          </Button>
          <Select
            size={"md"}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            variant="bordered"
            defaultSelectedKeys={"date"}
          >
            <SelectItem key="date" value="date">
              Date
            </SelectItem>
            <SelectItem key="title" value="title">
              Title
            </SelectItem>
            <SelectItem key="length" value="length">
              Length
            </SelectItem>
          </Select>
        </div>
        <input
          type="text"
          placeholder="Cerca note..."
          value={searchQuery}
          onChange={onSearch}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="group flex items-center justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
              onClick={() => onNoteSelect(note)}
            >
              <span className="text-gray-800 dark:text-gray-200 truncate">
                {note.title}
              </span>
              <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate({
                      ...note,
                      _id: undefined,
                      isPublic: note.isPublic,
                    });
                  }}
                  className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  title="Duplica nota"
                >
                  📋
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note._id!);
                  }}
                  className="text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  title="Elimina nota"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesSidebar;
