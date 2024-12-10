import Markdown from "react-markdown";
import { useState } from "react";

interface NoteEditorProps {
  title: string;
  content: string;
  tags: string;
  showMarkdown: boolean;
  isPublic: boolean;
  onIsPublicChange: (value: boolean) => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSave: (isPublic: boolean) => void;
  onToggleMarkdown: () => void;
  onBack: () => void;
  isEditing: boolean;
  isMobileView: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  title,
  content,
  tags,
  showMarkdown,
  isPublic,
  onIsPublicChange,
  onTitleChange,
  onContentChange,
  onTagsChange,
  onSave,
  onToggleMarkdown,
  onBack,
  isEditing,
  isMobileView,
}) => {
  const [copyStatus, setCopyStatus] = useState<string>("");

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus("Copiato!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (err) {
      setCopyStatus("Errore nella copia");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {isMobileView && (
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        >
          ← Indietro
        </button>
      )}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {isEditing ? "Modifica Nota" : "Crea Nuova Nota"}
      </h1>
      <input
        type="text"
        placeholder="Titolo"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <textarea
        placeholder="Contenuto"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="w-full p-2 border rounded h-40"
      />
      <input
        type="text"
        placeholder="Tag (separati da virgola)"
        value={tags}
        onChange={(e) => onTagsChange(e.target.value)}
        className="w-full p-2 border rounded"
      />

      {/* Toggle per nota pubblica/privata */}
      {!isEditing && (
        <div className="flex items-center gap-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => onIsPublicChange(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              Nota Pubblica
            </span>
          </label>
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onSave(isPublic)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isEditing ? "Aggiorna Nota" : "Salva Nota"}
        </button>
        <button
          onClick={onToggleMarkdown}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          {showMarkdown ? "Edit View" : "Markdown View"}
        </button>
        <button
          onClick={handleCopyContent}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          {copyStatus || "Copia Contenuto"}
        </button>
      </div>
      {showMarkdown && (
        <div className="mt-4 p-2 border rounded prose dark:prose-invert">
          <Markdown>{content}</Markdown>
        </div>
      )}
    </div>
  );
};
