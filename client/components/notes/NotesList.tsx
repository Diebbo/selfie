import { NoteModel } from "@/helpers/types";
import NoteCard from "./NoteCard";

interface NotesListProps {
  notes: NoteModel[];
  onNoteClick: (note: NoteModel) => void;
  onDelete: (id: string) => void;
  isMobileView?: boolean;
  onBack?: () => void;
}

const NotesList: React.FC<NotesListProps> = ({ 
  notes, 
  onNoteClick, 
  onDelete,
  isMobileView,
  onBack 
}) => {
  return (
    <div className="space-y-4">
      {isMobileView && onBack && (
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        >
          ← Indietro
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onClick={() => onNoteClick(note)}
            onDelete={() => onDelete(note._id!)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotesList;