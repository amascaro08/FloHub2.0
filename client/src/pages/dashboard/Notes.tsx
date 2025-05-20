import React, { useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Note type definition
interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  folder: string;
}

// Note detail component for displaying and editing a selected note
const NoteDetail = ({ 
  note, 
  onSave, 
  onDelete, 
  onFavoriteToggle 
}: { 
  note: Note; 
  onSave: (note: Note) => void; 
  onDelete: (id: number) => void;
  onFavoriteToggle: (id: number) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({ ...note });

  const handleSave = () => {
    const now = new Date().toISOString();
    onSave({ ...editedNote, updatedAt: now });
    setEditing(false);
  };

  const handleAddTag = () => {
    const tagInput = prompt('Enter a tag:');
    if (tagInput && tagInput.trim() !== '') {
      setEditedNote({
        ...editedNote,
        tags: [...editedNote.tags, tagInput.trim()]
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedNote({
      ...editedNote,
      tags: editedNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (!note) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        {editing ? (
          <input
            type="text"
            value={editedNote.title}
            onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Note title"
          />
        ) : (
          <h2 className="text-xl font-medium text-gray-800">{note.title}</h2>
        )}
        <div className="flex space-x-2">
          <button 
            onClick={() => onFavoriteToggle(note.id)}
            className={`p-2 rounded-full hover:bg-gray-100 ${note.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
          >
            ★
          </button>
          {editing ? (
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(note.id)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="p-5 flex-1 overflow-auto">
        {editing ? (
          <textarea
            value={editedNote.content}
            onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
            className="w-full h-64 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Note content"
          />
        ) : (
          <div className="prose max-w-none">
            {note.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-5 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">
              Created: {new Date(note.createdAt).toLocaleDateString()} • 
              Updated: {new Date(note.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {editing ? (
                <>
                  {editedNote.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs flex items-center"
                    >
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-teal-800 hover:text-teal-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={handleAddTag}
                    className="px-2 py-1 border border-dashed border-teal-300 text-teal-600 rounded-full text-xs hover:bg-teal-50"
                  >
                    + Add Tag
                  </button>
                </>
              ) : (
                note.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
          <div>
            <span className="text-sm px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
              {note.folder}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notes Dashboard Component
export default function NotesPage() {
  // Sample notes for demonstration
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: 'Project Ideas',
      content: 'Ideas for new projects:\n\n1. A productivity dashboard that integrates with multiple services\n2. A habit tracker with AI insights\n3. A note-taking app with automatic organization',
      tags: ['work', 'ideas', 'projects'],
      createdAt: '2025-05-15T12:00:00Z',
      updatedAt: '2025-05-18T14:30:00Z',
      isFavorite: true,
      folder: 'Work'
    },
    {
      id: 2,
      title: 'Meeting Notes: Team Sync',
      content: 'Attendees: John, Sarah, Michael\n\nDiscussed:\n- Project timeline updates\n- Resource allocation\n- Next milestone preparation\n\nAction items:\n- John to finalize the design by Friday\n- Sarah to coordinate with the client\n- Michael to prepare the development environment',
      tags: ['meeting', 'work', 'important'],
      createdAt: '2025-05-17T10:00:00Z',
      updatedAt: '2025-05-17T11:45:00Z',
      isFavorite: false,
      folder: 'Work'
    },
    {
      id: 3,
      title: 'Book Recommendations',
      content: 'Books to read:\n\n- Atomic Habits by James Clear\n- Deep Work by Cal Newport\n- The Psychology of Money by Morgan Housel\n- Project Hail Mary by Andy Weir',
      tags: ['personal', 'books', 'reading'],
      createdAt: '2025-05-10T18:20:00Z',
      updatedAt: '2025-05-19T20:15:00Z',
      isFavorite: true,
      folder: 'Personal'
    },
    {
      id: 4,
      title: 'Recipe: Pasta Carbonara',
      content: 'Ingredients:\n- 400g spaghetti\n- 200g pancetta or guanciale\n- 4 large eggs\n- 100g Pecorino Romano cheese\n- 50g Parmesan cheese\n- Black pepper\n- Salt\n\nInstructions:\n1. Cook pasta in salted water until al dente\n2. Cook pancetta until crispy\n3. Mix eggs and cheese in a bowl\n4. Combine everything while pasta is hot',
      tags: ['personal', 'cooking', 'recipe'],
      createdAt: '2025-05-12T19:10:00Z',
      updatedAt: '2025-05-12T19:10:00Z',
      isFavorite: false,
      folder: 'Personal'
    },
    {
      id: 5,
      title: 'Weekly Goals',
      content: 'Goals for this week:\n\n- Complete the project proposal\n- Schedule at least 3 client meetings\n- Start working on the presentation\n- Review team members\' work\n- Update the project timeline',
      tags: ['work', 'goals', 'planning'],
      createdAt: '2025-05-19T08:00:00Z',
      updatedAt: '2025-05-19T08:30:00Z',
      isFavorite: false,
      folder: 'Work'
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'favorites' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    tags: [],
    folder: 'Work',
  });

  // Get all unique folders
  const folders = Array.from(new Set(notes.map(note => note.folder)));

  // Filter notes based on current filter and search query
  const filteredNotes = notes.filter(note => {
    // First apply folder/favorites filter
    const folderMatch = filter === 'all' || 
                        (filter === 'favorites' && note.isFavorite) ||
                        note.folder === filter;
    
    // Then apply search query filter
    const search = searchQuery.toLowerCase();
    const searchMatch = !searchQuery || 
                        note.title.toLowerCase().includes(search) || 
                        note.content.toLowerCase().includes(search) ||
                        note.tags.some(tag => tag.toLowerCase().includes(search));
    
    return folderMatch && searchMatch;
  });

  // Create a new note
  const handleCreateNote = () => {
    if (!newNote.title) return;
    
    const now = new Date().toISOString();
    const createdNote: Note = {
      id: notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1,
      title: newNote.title || 'Untitled Note',
      content: newNote.content || '',
      tags: newNote.tags || [],
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      folder: newNote.folder || 'Work',
    };
    
    const updatedNotes = [...notes, createdNote];
    setNotes(updatedNotes);
    setSelectedNote(createdNote);
    setShowNewNoteForm(false);
    setNewNote({
      title: '',
      content: '',
      tags: [],
      folder: 'Work',
    });
  };

  // Save an edited note
  const handleSaveNote = (updatedNote: Note) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
    setSelectedNote(updatedNote);
  };

  // Delete a note
  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
    setSelectedNote(null);
  };

  // Toggle favorite status
  const handleFavoriteToggle = (id: number) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    );
    setNotes(updatedNotes);
    
    // Update selected note if it's the one being toggled
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote({ ...selectedNote, isFavorite: !selectedNote.isFavorite });
    }
  };

  // Add a tag to new note
  const handleAddTag = () => {
    const tagInput = prompt('Enter a tag:');
    if (tagInput && tagInput.trim() !== '') {
      setNewNote({
        ...newNote,
        tags: [...(newNote.tags || []), tagInput.trim()]
      });
    }
  };

  // Add a new folder
  const handleAddFolder = () => {
    const folderInput = prompt('Enter a new folder name:');
    if (folderInput && folderInput.trim() !== '' && !folders.includes(folderInput.trim())) {
      setNewNote({
        ...newNote,
        folder: folderInput.trim()
      });
    }
  };

  return (
    <DashboardLayout title="Notes">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <button
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            onClick={() => setShowNewNoteForm(!showNewNoteForm)}
          >
            {showNewNoteForm ? 'Cancel' : '+ New Note'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filters</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setFilter('all')}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        filter === 'all' 
                          ? 'bg-teal-50 text-teal-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All Notes
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setFilter('favorites')}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        filter === 'favorites' 
                          ? 'bg-teal-50 text-teal-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Favorites
                    </button>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Folders</h3>
                <ul className="space-y-1">
                  {folders.map((folder) => (
                    <li key={folder}>
                      <button
                        onClick={() => setFilter(folder)}
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          filter === folder 
                            ? 'bg-teal-50 text-teal-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {folder}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Notes List */}
            <div className="bg-white rounded-xl shadow-sm p-5 h-[calc(100vh-18rem)] overflow-y-auto">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                {filter === 'all' ? 'All Notes' : 
                 filter === 'favorites' ? 'Favorites' : 
                 filter}
                <span className="ml-2 text-sm text-gray-500">({filteredNotes.length})</span>
              </h2>
              
              {filteredNotes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No notes found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotes.map((note) => (
                    <div 
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedNote && selectedNote.id === note.id 
                          ? 'bg-teal-50 border border-teal-200' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800 flex items-center">
                            {note.isFavorite && <span className="text-yellow-500 mr-1">★</span>}
                            {note.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {note.content.substring(0, 100)}
                            {note.content.length > 100 ? '...' : ''}
                          </p>
                          <div className="flex mt-2 items-center text-xs text-gray-500">
                            <span className="mr-2">{new Date(note.updatedAt).toLocaleDateString()}</span>
                            {note.tags.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                                {note.tags[0]}{note.tags.length > 1 ? ` +${note.tags.length - 1}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Note detail or new note form */}
          <div className="md:col-span-2 h-[calc(100vh-8rem)]">
            {showNewNoteForm ? (
              <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
                <div className="p-5 border-b border-gray-200">
                  <h2 className="text-xl font-medium text-gray-800">Create New Note</h2>
                </div>
                
                <div className="p-5 flex-1 overflow-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title*
                      </label>
                      <input
                        type="text"
                        value={newNote.title || ''}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Note title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        value={newNote.content || ''}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        className="w-full h-64 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Note content"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Folder
                        </label>
                        <div className="flex">
                          <select
                            value={newNote.folder || 'Work'}
                            onChange={(e) => setNewNote({ ...newNote, folder: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-teal-500 focus:border-teal-500"
                          >
                            {folders.map((folder) => (
                              <option key={folder} value={folder}>{folder}</option>
                            ))}
                          </select>
                          <button
                            onClick={handleAddFolder}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newNote.tags && newNote.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs flex items-center">
                            {tag}
                            <button 
                              onClick={() => {
                                const updatedTags = [...(newNote.tags || [])];
                                updatedTags.splice(index, 1);
                                setNewNote({ ...newNote, tags: updatedTags });
                              }}
                              className="ml-1 text-teal-800 hover:text-teal-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="text-sm text-teal-600 hover:text-teal-800"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={handleCreateNote}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    >
                      Create Note
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedNote ? (
              <NoteDetail 
                note={selectedNote} 
                onSave={handleSaveNote} 
                onDelete={handleDeleteNote}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm h-full flex items-center justify-center">
                <div className="text-center p-5">
                  <p className="text-gray-500 mb-4">Select a note to view or edit</p>
                  <button
                    onClick={() => setShowNewNoteForm(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    Create a New Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}