import { useState } from "react";

const defaultForm = {
  title: "",
  location: "",
  category: "OTHER",
  description: "",
  priority: "MEDIUM",
  preferredContact: "",
  assignedTo: "",
  resolutionNotes: "",
};

export default function TicketForm({ initialData, onSubmit, submitText }) {
  const [form, setForm] = useState(initialData || defaultForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Failed to save ticket");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="ticket-form card" onSubmit={handleSubmit}>
      <h2>{submitText}</h2>

      {error && <div className="error-box">{error}</div>}

      <div className="form-grid">
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input id="location" name="location" value={form.location} onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            <option value="ELECTRICAL">Electrical</option>
            <option value="NETWORK">Network</option>
            <option value="PROJECTOR">Projector</option>
            <option value="FURNITURE">Furniture</option>
            <option value="CLEANING">Cleaning</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="preferredContact">Preferred Contact</label>
          <input
            id="preferredContact"
            name="preferredContact"
            value={form.preferredContact}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="assignedTo">Assigned To</label>
          <input id="assignedTo" name="assignedTo" value={form.assignedTo} onChange={handleChange} />
        </div>
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="5"
          required
        />
      </div>

      <div>
        <label htmlFor="resolutionNotes">Resolution Notes</label>
        <textarea
          id="resolutionNotes"
          name="resolutionNotes"
          value={form.resolutionNotes}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : submitText}
      </button>
    </form>
  );
}