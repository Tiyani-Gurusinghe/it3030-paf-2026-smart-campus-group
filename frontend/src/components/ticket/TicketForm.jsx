import { useEffect, useMemo, useState } from "react";
import useAuth from "../../features/auth/hooks/useAuth";
import resourceApi from "../../features/resources/api/resourceApi";
import { getSkillsForResource } from "../../api/ticket/ticketApi";

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const CONTACT_REGEX = /^(\+?[0-9][0-9\s-]{6,18}|[^\s@]+@[^\s@]+\.[^\s@]+)$/;
const PRIORITY_DUE_INFO = {
  HIGH: "High priority - Due in 1 day",
  MEDIUM: "Medium priority - Due in 5 days",
  LOW: "Low priority - Due in 14 days",
};

const defaultForm = {
  resourceId: "",
  title: "",
  description: "",
  requiredSkillId: "",
  priority: "MEDIUM",
  preferredContact: "",
  location: "",
  category: "",
};

export default function TicketForm({ initialData, onSubmit, submitText = "Submit" }) {
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSub, setFilterSub] = useState("");

  useEffect(() => {
    const normalized = initialData
      ? {
        ...defaultForm,
        ...initialData,
        resourceId: initialData.resourceId ? String(initialData.resourceId) : "",
        requiredSkillId: initialData.requiredSkillId ? String(initialData.requiredSkillId) : "",
        preferredContact:
          initialData.preferredContact ?? initialData.preferredContactDetails ?? "",
      }
      : defaultForm;

    setForm(normalized);
  }, [initialData]);

  useEffect(() => {
    async function fetchResources() {
      try {
        const data = await resourceApi.getAllResources();
        setResources(data);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      } finally {
        setLoadingResources(false);
      }
    }
    fetchResources();
  }, []);

  useEffect(() => {
    async function fetchSkills() {
      if (!form.resourceId) {
        setSkills([]);
        return;
      }

      setLoadingSkills(true);
      try {
        const data = await getSkillsForResource(Number(form.resourceId));
        const options = Array.isArray(data) ? data : [];
        setSkills(options);

        if (form.requiredSkillId) {
          const hasSelected = options.some(
            (item) => Number(item.id) === Number(form.requiredSkillId)
          );
          if (!hasSelected) {
            setForm((prev) => ({ ...prev, requiredSkillId: "" }));
          }
        }
      } catch (err) {
        setSkills([]);
        setError(err.message || "Failed to load skills for selected resource");
      } finally {
        setLoadingSkills(false);
      }
    }

    fetchSkills();
  }, [form.resourceId]);

  const selectedResource = useMemo(
    () => resources.find((r) => r.id === Number(form.resourceId)),
    [resources, form.resourceId]
  );

  const buildings = useMemo(() => resources.filter(r => r.category === "BUILDING"), [resources]);
  const assetTypes = useMemo(() => {
    const types = new Set();
    resources.forEach(r => {
      if (r.category === "EQUIPMENT" || r.category === "UTILITY") {
        if (r.type) types.add(r.type);
      }
    });
    return Array.from(types).sort();
  }, [resources]);

  const filteredResources = useMemo(() => {
    let list = resources;
    if (filterCategory === "INFRA") {
      list = list.filter(r => r.category === "BUILDING" || r.category === "SPACE");
      if (filterSub) {
        list = list.filter(r => String(r.id) === filterSub || (r.parentResource && String(r.parentResource.id) === filterSub));
      }
    } else if (filterCategory === "INV") {
      list = list.filter(r => r.category === "EQUIPMENT" || r.category === "UTILITY");
      if (filterSub) {
        list = list.filter(r => r.type === filterSub);
      }
    }
    return list;
  }, [resources, filterCategory, filterSub]);

  function handleChange(e) {
    const { name, value } = e.target;
    
    if (name === "resourceId") {
      if (value) {
        const r = resources.find(x => String(x.id) === value);
        if (r) {
          if (r.category === "BUILDING" || r.category === "SPACE") {
            setFilterCategory("INFRA");
            if (r.category === "BUILDING") setFilterSub(String(r.id));
            else if (r.parentResource) setFilterSub(String(r.parentResource.id));
            else setFilterSub("");
          } else if (r.category === "EQUIPMENT" || r.category === "UTILITY") {
            setFilterCategory("INV");
            setFilterSub(r.type || "");
          }
        }
      }
      setForm(prev => ({ ...prev, resourceId: value, requiredSkillId: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAttachmentChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setAttachmentFiles([]);
      return;
    }

    if (files.length > MAX_ATTACHMENTS) {
      setError("You can upload up to 3 attachments.");
      return;
    }

    for (const file of files) {
      if (!file.type?.startsWith("image/")) {
        setError("Only image files are allowed for attachments.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Each attachment must be 5MB or smaller.");
        return;
      }
    }

    setError("");
    setAttachmentFiles(files);
  }

  // Frontend validation gives quick feedback; backend validation still enforces the final rules.
  function validateForm() {
    const title = (form.title || "").trim();
    const description = (form.description || "").trim();
    const preferredContact = (form.preferredContact || "").trim();

    if (!form.resourceId) {
      return "Please select an affected resource.";
    }
    if (!form.requiredSkillId) {
      return "Please select the required skill.";
    }
    if (!title) {
      return "Title is required.";
    }
    if (title.length > 120) {
      return "Title must be at most 120 characters.";
    }
    if (!description) {
      return "Description is required.";
    }
    if (description.length > 1000) {
      return "Description must be at most 1000 characters.";
    }
    if (!preferredContact) {
      return "Preferred contact is required.";
    }
    if (preferredContact.length > 120) {
      return "Preferred contact must be at most 120 characters.";
    }
    if (!CONTACT_REGEX.test(preferredContact)) {
      return "Preferred contact must be a valid phone number or email.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        resourceId: form.resourceId ? Number(form.resourceId) : null,
        requiredSkillId: form.requiredSkillId ? Number(form.requiredSkillId) : null,
        reportedBy: user?.id ?? null,
        location: selectedResource?.location || form.location || "Campus",
        category: selectedResource?.category || form.category || "GENERAL",
        preferredContact: form.preferredContact?.trim() || "",
      };
      await onSubmit(payload, attachmentFiles);
    } catch (err) {
      setError(err.message || "Failed to save ticket");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="ticket-form card" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{initialData ? "Edit Ticket" : "Create New Ticket"}</h2>
        <p>Submit a maintenance or incident report for the campus.</p>
      </div>

      {error && (
        <div className="error-box">
          <span>Error</span> {error}
        </div>
      )}

      <div className="form-section-title">1. Select Resource</div>
      {loadingResources ? (
        <div className="skeleton-line" style={{ height: "40px", marginBottom: "16px" }} />
      ) : (
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div className="form-field" style={{ flex: 1, minWidth: "180px", marginBottom: 0 }}>
            <label>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSub("");
                setForm(prev => ({ ...prev, resourceId: "", requiredSkillId: "" }));
              }}
              className="resource-select"
            >
              <option value="">All Categories</option>
              <option value="INFRA">Infrastructure (Buildings & Spaces)</option>
              <option value="INV">Inventory (Standalone Assets)</option>
            </select>
          </div>

          {filterCategory === "INFRA" && (
            <div className="form-field" style={{ flex: 1, minWidth: "180px", marginBottom: 0 }}>
              <label>Building</label>
              <select
                value={filterSub}
                onChange={(e) => {
                  setFilterSub(e.target.value);
                  setForm(prev => ({ ...prev, resourceId: "", requiredSkillId: "" }));
                }}
                className="resource-select"
              >
                <option value="">All Buildings</option>
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          {filterCategory === "INV" && (
            <div className="form-field" style={{ flex: 1, minWidth: "180px", marginBottom: 0 }}>
              <label>Asset Type</label>
              <select
                value={filterSub}
                onChange={(e) => {
                  setFilterSub(e.target.value);
                  setForm(prev => ({ ...prev, resourceId: "", requiredSkillId: "" }));
                }}
                className="resource-select"
              >
                <option value="">All Types</option>
                {assetTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="resourceId">Affected Resource *</label>
        {loadingResources ? (
          <div className="skeleton-line" style={{ height: "40px" }} />
        ) : (
          <select
            id="resourceId"
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            required
            className="resource-select"
          >
            <option value="">-- Select a resource --</option>
            {filteredResources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} {r.location ? `(${r.location})` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedResource && (
        <div className="resource-details-panel">
          <p>
            <strong>Type:</strong> {selectedResource.type?.replace("_", " ")}
          </p>
          <p>
            <strong>Location:</strong> {selectedResource.location || "N/A"}
          </p>
          <p>
            <strong>Category:</strong> {selectedResource.category?.replace("_", " ") || "N/A"}
          </p>
        </div>
      )}

      <div className="form-section-title">2. Issue Details</div>
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

        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="priority">Priority *</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <p className="field-hint">
            {PRIORITY_DUE_INFO[form.priority]}
          </p>
          <div className="priority-due-guide" aria-label="Priority due date guide">
            <span>High: 1 day</span>
            <span>Medium: 5 days</span>
            <span>Low: 14 days</span>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="preferredContact">Preferred Contact *</label>
          <input
            id="preferredContact"
            name="preferredContact"
            value={form.preferredContact}
            onChange={handleChange}
            placeholder="e.g. 0771234567 or email"
            required
          />
        </div>

        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="requiredSkillId">Required Skill *</label>
          {loadingSkills ? (
            <div className="skeleton-line" style={{ height: "40px" }} />
          ) : (
            <select
              id="requiredSkillId"
              name="requiredSkillId"
              value={form.requiredSkillId}
              onChange={handleChange}
              required
              disabled={!form.resourceId || skills.length === 0}
            >
              <option value="">
                {form.resourceId
                  ? skills.length
                    ? "-- Select required skill --"
                    : "No configured skills for selected resource"
                  : "Select a resource first"}
              </option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {!initialData && (
          <div className="form-field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="attachments">Attachments (up to 3 images, max 5MB each)</label>
            <input
              id="attachments"
              name="attachments"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleAttachmentChange}
            />
            {attachmentFiles.length > 0 && (
              <p className="field-hint">
                Selected: {attachmentFiles.map((f) => f.name).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving..." : submitText}
        </button>
      </div>
    </form>
  );
}
