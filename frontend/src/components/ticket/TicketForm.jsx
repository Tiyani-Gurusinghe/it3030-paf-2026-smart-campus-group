import { useState } from "react";
import useAuth from "../../features/auth/hooks/useAuth";

const defaultForm = {
  title: "",
  description: "",
  resourceId: "",
  requiredSkillId: "",
  priority: "MEDIUM",
  preferredContactDetails: "",
};

export default function TicketForm({ initialData, onSubmit, submitText = "Submit" }) {
  const { user } = useAuth();
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
      const payload = {
        ...form,
        resourceId: form.resourceId ? Number(form.resourceId) : null,
        requiredSkillId: form.requiredSkillId ? Number(form.requiredSkillId) : null,
        reportedBy: user?.id ?? null,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Failed to save ticket");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="ticket-form card" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>🎫 {initialData ? "Edit Ticket" : "Create New Ticket"}</h2>
        <p>Submit a maintenance or incident report for the campus.</p>
      </div>

      {error && (
        <div className="error-box">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="form-section-title">Basic Information</div>
      <div className="form-grid">
        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Projector not working in Room 204"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="resourceId">Resource ID *</label>
          <input
            id="resourceId"
            name="resourceId"
            type="number"
            min="1"
            value={form.resourceId}
            onChange={handleChange}
            placeholder="e.g. 1"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="requiredSkillId">Required Skill ID *</label>
          <input
            id="requiredSkillId"
            name="requiredSkillId"
            type="number"
            min="1"
            value={form.requiredSkillId}
            onChange={handleChange}
            placeholder="e.g. 2"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="priority">Priority *</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="LOW">🟢 Low</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="HIGH">🔴 High</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="preferredContactDetails">Preferred Contact</label>
          <input
            id="preferredContactDetails"
            name="preferredContactDetails"
            value={form.preferredContactDetails}
            onChange={handleChange}
            placeholder="e.g. 0771234567 or email"
          />
        </div>
      </div>

      <div className="form-section-title">Description</div>
      <div className="form-field">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          placeholder="Describe the issue in detail..."
          required
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