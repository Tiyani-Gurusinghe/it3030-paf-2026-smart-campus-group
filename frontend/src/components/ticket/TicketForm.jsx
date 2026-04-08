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
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const isEdit = Boolean(initialData);

  return (
    <form className="ticket-form card" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{isEdit ? "✏️ Edit Ticket" : "🎫 Create New Ticket"}</h2>
        <p>
          {isEdit
            ? "Update the details of an existing maintenance ticket."
            : "Submit a new maintenance or incident report for the campus."}
        </p>
      </div>

      {error && (
        <div className="error-box">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="form-section-title">Basic Information</div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Broken AC in Room 204"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Block A, Room 204"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            <option value="ELECTRICAL">⚡ Electrical</option>
            <option value="NETWORK">🌐 Network</option>
            <option value="PROJECTOR">📽️ Projector</option>
            <option value="FURNITURE">🪑 Furniture</option>
            <option value="CLEANING">🧹 Cleaning</option>
            <option value="OTHER">📋 Other</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="LOW">🟢 Low</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="HIGH">🔴 High</option>
          </select>
        </div>
      </div>

      <div className="form-section-title">Contact & Assignment</div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="preferredContact">Preferred Contact</label>
          <input
            id="preferredContact"
            name="preferredContact"
            value={form.preferredContact}
            onChange={handleChange}
            placeholder="e.g. email@campus.edu or +94 71 ..."
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="assignedTo">Assigned To</label>
          <input
            id="assignedTo"
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            placeholder="Staff member or team (optional)"
          />
        </div>
      </div>

      <div className="form-section-title">Details</div>
      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="5"
          placeholder="Describe the issue in detail..."
          required
        />
      </div>

      <div className="form-field" style={{ marginTop: 16 }}>
        <label htmlFor="resolutionNotes">Resolution Notes</label>
        <textarea
          id="resolutionNotes"
          name="resolutionNotes"
          value={form.resolutionNotes}
          onChange={handleChange}
          rows="3"
          placeholder="Any resolution notes or follow-up actions (optional)..."
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "⏳ Saving..." : submitText}
        </button>
      </div>
    </form>
  );
}