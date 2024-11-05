import React from "react";
import { NoteModel } from "@/helpers/types";

interface NoteCardProps {
  note: NoteModel;
  onClick: (note: NoteModel) => void;
  onDelete: (id?: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onDelete }) => {

  return (
    <div
      key={note._id}
      className="p-4 rounded shadow cursor-pointer bg-yellow-200 relative"
      style={{ height: "150px", overflow: "hidden" }}
      onClick={() => onClick(note)}
    >
      <h3 className="font-bold mb-2 text-black">{note.title}</h3>
      <p className="text-sm text-gray-700 truncate">{note.content}</p>
      <span className="absolute top-2 right-2 text-xs text-gray-600">
        {new Date(note.date!).toLocaleDateString("it-IT")}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note._id);
        }}
        className="absolute bottom-2 right-2 text-red-500 hover:text-red-700"
      >
        🗑️
      </button>
    </div>
  );
};

export default NoteCard;