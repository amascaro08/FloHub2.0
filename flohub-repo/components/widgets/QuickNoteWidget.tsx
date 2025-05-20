"use client";

import { useSession } from "next-auth/react";
import { useState, FormEvent, useMemo, memo } from "react"; // Import useMemo and memo
import useSWR from "swr"; // Import useSWR
import CreatableSelect from 'react-select/creatable'; // Import CreatableSelect
import type { UserSettings, Note } from "@/types/app"; // Import UserSettings and Note types
import type { GetNotesResponse } from "@/pages/api/notes"; // Import GetNotesResponse

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function QuickNoteWidget() {
  const { data: session, status } = useSession();
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Use state for selected tags
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const shouldFetch = status === "authenticated";

  // Fetch user settings to get global tags
  const { data: userSettings, error: settingsError } = useSWR<UserSettings>(
    shouldFetch ? "/api/userSettings" : null,
    fetcher
  );

  // Fetch existing quick notes to get their tags (assuming quick notes are just notes with a source)
  const { data: notesResponse, error: notesError } = useSWR<GetNotesResponse>(
    shouldFetch ? "/api/notes?source=quicknote" : null, // Filter by source if possible, otherwise fetch all notes
    fetcher
  );

  // Combine global tags and quick note tags
  const allAvailableTags = useMemo(() => {
    const globalTags = userSettings?.globalTags || [];
    return Array.from(new Set(globalTags)).sort();
  }, [userSettings]);

  const tagOptions = allAvailableTags.map(tag => ({ value: tag, label: tag }));

  const handleTagChange = (selectedOptions: any) => {
    setSelectedTags(Array.isArray(selectedOptions) ? selectedOptions.map(option => option.value) : []);
  };


  const handleSaveNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/notes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tags: selectedTags, source: "quicknote" }), // Include source and selectedTags
      });

      if (response.ok) {
        setContent(""); // Clear content on success
        setSelectedTags([]); // Clear selected tags on success
        setSaveStatus("success");
        // Optionally, trigger a re-fetch of notes in the Notes list if it were visible
      } else {
        const errorData = await response.json();
        setSaveStatus("error");
        console.error("Failed to save note:", errorData.error);
      }
    } catch (error) {
      setSaveStatus("error");
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
      // Reset status after a few seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  if (status === "loading" || (!userSettings && !settingsError && shouldFetch) || (!notesResponse && !notesError && shouldFetch)) { // Add loading checks for settings and notes
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Please sign in to add notes.</p>;
  }

  if (settingsError || notesError) { // Add error checks for settings and notes
    return <p>Error loading data.</p>;
  }


  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSaveNote} className="flex flex-col flex-1 gap-3">
        <textarea
          className="input-modern flex-1 resize-none"
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSaving}
        />
        <CreatableSelect
          isMulti
          options={tagOptions}
          onChange={handleTagChange}
          placeholder="Select or create tags..."
          isDisabled={isSaving}
          isSearchable
          value={selectedTags.map(tag => ({ value: tag, label: tag }))}
          classNamePrefix="react-select"
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: '#14B8A6',
              primary25: '#99F6E4',
            },
          })}
        />
        <div className="flex justify-between items-center mt-1">
          {saveStatus === "success" && (
            <p className="text-green-600 dark:text-green-400 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Note saved!
            </p>
          )}
          {saveStatus === "error" && (
            <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Failed to save note
            </p>
          )}
          <button
            type="submit"
            className={`btn-primary ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : "Save Note"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default memo(QuickNoteWidget);