// src/components/SkillPicker.jsx
// Shows every skill companies are asking for (from the jobs in the database),
// with how many jobs want it. Click a skill to add/remove it.

export default function SkillPicker({ skills, selected, onChange }) {
  const isSelected = (name) => selected.some((s) => s.toLowerCase() === name.toLowerCase());

  function toggle(name) {
    onChange(isSelected(name) ? selected.filter((s) => s.toLowerCase() !== name.toLowerCase()) : [...selected, name]);
  }

  if (skills.length === 0) {
    return <p className="hint">No jobs loaded yet. Load sample jobs from the Overview page to see in-demand skills.</p>;
  }

  return (
    <div className="skill-picker">
      {skills.map(({ name, count }) => (
        <button
          type="button"
          key={name}
          className={`skill-pill ${isSelected(name) ? "on" : ""}`}
          onClick={() => toggle(name)}
          aria-pressed={isSelected(name)}
        >
          {name}
          <span className="skill-count">{count}</span>
        </button>
      ))}
    </div>
  );
}
