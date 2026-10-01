// src/components/TagInput.jsx
// Type a value and press Enter (or comma) to add it as a chip.
// Optional "suggestions": clickable chips shown under the box.

import { useState } from "react";

export default function TagInput({ tags, onChange, placeholder, suggestions = [] }) {
  const [text, setText] = useState("");

  const hasTag = (value) => tags.some((t) => t.toLowerCase() === value.toLowerCase());

  function addTag(value) {
    const clean = value.trim().replace(/,$/, "");
    if (clean && !hasTag(clean)) onChange([...tags, clean]);
    setText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(text);
    }
    // Backspace on an empty box removes the last chip
    if (e.key === "Backspace" && !text && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  const openSuggestions = suggestions.filter((s) => !hasTag(s)).slice(0, 10);

  return (
    <div>
      <div className="tag-box">
        {tags.map((tag) => (
          <span key={tag} className="chip chip-selected">
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(tags.filter((t) => t !== tag))}>
              ×
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => text && addTag(text)}
          placeholder={tags.length === 0 ? placeholder : "Add more…"}
        />
      </div>

      {openSuggestions.length > 0 && (
        <div className="suggestions">
          {openSuggestions.map((s) => (
            <button type="button" key={s} className="chip chip-suggest" onClick={() => addTag(s)}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
