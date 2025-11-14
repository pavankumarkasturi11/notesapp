import { useState } from "react";
import "./App.css";

interface Note {
  id: string;
  content: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState("");

  const handleAddNote = () => {
    if (newNoteContent.trim() === "") return;

    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent,
    };

    setNotes([...notes, newNote]);
    setNewNoteContent("");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleEditNote = (id: string, content: string) => {
    setEditingNoteId(id);
    setEditedNoteContent(content);
  };

  const handleSaveEdit = (id: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, content: editedNoteContent } : note
      )
    );

    setEditingNoteId(null);
    setEditedNoteContent("");
  };

  return (
    <div className="App">
      <h1>My Notes</h1>

      <div className="add-note-section">
        <input
          type="text"
          placeholder="Add a new note..."
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
        />
        <button onClick={handleAddNote}>Add Note</button>
      </div>

      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.id} className="note-item">
            {editingNoteId === note.id ? (
              <>
                <input
                  type="text"
                  value={editedNoteContent}
                  onChange={(e) => setEditedNoteContent(e.target.value)}
                />
                <button onClick={() => handleSaveEdit(note.id)}>Save</button>
              </>
            ) : (
              <>
                <span>{note.content}</span>
                <button onClick={() => handleEditNote(note.id, note.content)}>
                  Edit
                </button>
                <button onClick={() => handleDeleteNote(note.id)}>
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
