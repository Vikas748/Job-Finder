// src/components/TagInput.jsx
// Reusable tag/chip input widget.
// Users type a value and press Enter or comma to add a tag.

import { useState } from "react";

export default function TagInput({ tags, onChange, placeholder = "Type and press Enter…" }) {
  const [inputValue, setInputValue] = useState("");

  function handleKeyDown(e) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();

    const value = inputValue.trim().replace(/,$/, "");
    if (!value) return;
    if (tags.includes(value)) { setInputValue(""); return; }   // no duplicates

    onChange([...tags, value]);
    setInputValue("");
  }

  function removeTag(tagToRemove) {
    onChange(tags.filter(t => t !== tagToRemove));
  }

  return (
    <div className="tag-input-wrapper" onClick={() => document.getElementById("ti-" + placeholder)?.focus()}>
      {tags.map(tag => (
        <span key={tag} className="tag">
          {tag}
          <span className="tag-remove" onClick={() => removeTag(tag)}>×</span>
        </span>
      ))}
      <input
        id={"ti-" + placeholder}
        className="tag-field"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
      />
    </div>
  );
}
