import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getTicket,
  updateTicketStatus,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  uploadAttachments,
  deleteAttachment,
} from "../../api/ticket/ticketApi";
import StatusBadge from "../../components/ticket/StatusBadge";
import useAuth from "../../features/auth/hooks/useAuth";

const CATEGORY_ICONS = {
  ELECTRICAL: "⚡", NETWORK: "🌐", PROJECTOR: "📽️",
  FURNITURE: "🪑", CLEANING: "🧹", OTHER: "📋",
};

const PRIORITY_COLORS = { LOW: "low", MEDIUM: "medium", HIGH: "high" };

// ─── Attachments ────────────────────────────────────────────
function AttachmentsSection({ ticketId, attachments, onUploaded, onDeleted }) {
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef();

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (attachments.length + files.length > 3) {
      alert("A ticket can have at most 3 attachments.");
      return;
    }
    setUploading(true);
    try {
      const newOnes = await uploadAttachments(ticketId, files);
      onUploaded(newOnes);
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(attachmentId) {
    if (!window.confirm("Remove this attachment?")) return;
    try {
      await deleteAttachment(ticketId, attachmentId);
      onDeleted(attachmentId);
    } catch (err) {
      alert(err.message || "Failed to delete attachment");
    }
  }

  return (
    <div className="details-section">
      <div className="details-section-label">📎 Attachments ({attachments.length}/3)</div>
      {attachments.length > 0 ? (
        <div className="attachments-grid">
          {attachments.map((a) => (
            <div key={a.id} className="attachment-thumb">
              <img
                src={a.fileUrl}
                alt={a.fileName}
                onClick={() => setLightbox(a.fileUrl)}
              />
              <button
                className="attachment-delete-btn"
                onClick={() => handleDelete(a.id)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 14 }}>
          No attachments yet.
        </p>
      )}

      {attachments.length < 3 && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <button
            className="btn secondary"
            style={{ marginTop: 12, fontSize: 12 }}
            onClick={() => fileRef.current.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "📷 Add Image"}
          </button>
        </>
      )}

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Full size" className="lightbox-img" />
        </div>
      )}
    </div>
  );
}

// ─── Comments ───────────────────────────────────────────────
function CommentsSection({ ticketId }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getComments(ticketId).then(setComments).catch(() => {});
  }, [ticketId]);

  async function handleAdd() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const c = await addComment(ticketId, newComment.trim());
      setComments((prev) => [...prev, c]);
      setNewComment("");
    } catch (err) {
      alert(err.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(commentId) {
    if (!editContent.trim()) return;
    try {
      const updated = await updateComment(ticketId, commentId, editContent.trim());
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingId(null);
    } catch (err) {
      alert(err.message || "Failed to update comment");
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(ticketId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.message || "Failed to delete comment");
    }
  }

  const canModify = (comment) =>
    isAdmin || (user && comment.authorId === user.id);

  return (
    <div className="details-section">
      <div className="details-section-label">💬 Comments ({comments.length})</div>

      {comments.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 14, marginBottom: 16 }}>
          No comments yet. Be the first to comment.
        </p>
      )}

      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <div className="comment-avatar">{c.authorName?.charAt(0) ?? "?"}</div>
              <div className="comment-meta">
                <span className="comment-author">{c.authorName}</span>
                <span className="comment-time">
                  {new Date(c.createdAt).toLocaleString()}
                  {c.updatedAt !== c.createdAt && " (edited)"}
                </span>
              </div>
              {canModify(c) && (
                <div className="comment-actions">
                  {editingId !== c.id && (
                    <button
                      className="comment-action-btn"
                      onClick={() => { setEditingId(c.id); setEditContent(c.content); }}
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    className="comment-action-btn danger"
                    onClick={() => handleDelete(c.id)}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>

            {editingId === c.id ? (
              <div className="comment-edit-form">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="btn" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => handleUpdate(c.id)}>
                    Save
                  </button>
                  <button className="btn secondary" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="comment-content">{c.content}</p>
            )}
          </div>
        ))}
      </div>

      {user && (
        <div className="comment-input-area">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <button
            className="btn"
            style={{ marginTop: 10, alignSelf: "flex-end" }}
            onClick={handleAdd}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function TicketDetailsPage() {
  const { id } = useParams();
  const { user, isAdmin, isStaff } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await getTicket(id);
        setTicket(data);
      } catch (err) {
        setError(err.message || "Failed to load ticket");
      }
    }
    loadTicket();
  }, [id]);

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    try {
      setSaving(true);
      const updated = await updateTicketStatus(id, {
        status: newStatus,
        assignedTo: ticket.assignedTo || "",
        resolutionNotes: ticket.resolutionNotes || "",
      });
      setTicket(updated);
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  function handleAttachmentsUploaded(newAttachments) {
    setTicket((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments],
    }));
  }

  function handleAttachmentDeleted(attachmentId) {
    setTicket((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.id !== attachmentId),
    }));
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-box"><span>⚠️</span> {error}</div>
        <Link to="/tickets" className="btn secondary" style={{ marginTop: 12 }}>← Back</Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page">
        <div className="skeleton-grid">
          <div className="skeleton-card" style={{ height: 500, gridColumn: "1 / -1" }} />
        </div>
      </div>
    );
  }

  const categoryIcon = CATEGORY_ICONS[ticket.category] ?? "📋";
  const priorityLevel = PRIORITY_COLORS[ticket.priority] ?? "medium";
  const isOwner = user && ticket.reportedBy === user.id;
  const canChangeStatus = isAdmin || isStaff;

  // Status options vary by role
  const statusOptions = isAdmin
    ? ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"]
    : isStaff
    ? ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]
    : [];

  return (
    <div className="page">
      <div className="card details-card">

        {/* Header */}
        <div className="details-header">
          <div>
            <h1 className="details-title">{categoryIcon} {ticket.title}</h1>
            <p className="details-location">📍 {ticket.location}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <StatusBadge status={ticket.status} />
            {ticket.commentCount > 0 && (
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                💬 {ticket.commentCount} comment{ticket.commentCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Meta Grid */}
        <div className="details-grid">
          <div className="detail-item">
            <div className="detail-item-label">Category</div>
            <div className="detail-item-value">{categoryIcon} {ticket.category}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Priority</div>
            <div className="detail-item-value">
              <span className={`priority-badge priority-badge-${priorityLevel}`}>
                <span className={`priority-dot priority-dot-${priorityLevel}`}
                  style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", marginRight: 6 }} />
                {ticket.priority}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Preferred Contact</div>
            <div className="detail-item-value">{ticket.preferredContact || "—"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-item-label">Assigned To</div>
            <div className="detail-item-value">
              {ticket.assignedTo || (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Unassigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="details-section">
          <div className="details-section-label">Description</div>
          <p>{ticket.description || "No description."}</p>
        </div>

        <hr className="details-section-divider" />

        {/* Resolution Notes */}
        <div className="details-section">
          <div className="details-section-label">Resolution Notes</div>
          <p>
            {ticket.resolutionNotes || (
              <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                No resolution notes yet.
              </span>
            )}
          </p>
        </div>

        <hr className="details-section-divider" />

        {/* Attachments */}
        <AttachmentsSection
          ticketId={ticket.id}
          attachments={ticket.attachments || []}
          onUploaded={handleAttachmentsUploaded}
          onDeleted={handleAttachmentDeleted}
        />

        <hr className="details-section-divider" />

        {/* Comments */}
        <CommentsSection ticketId={ticket.id} />

        <hr className="details-section-divider" />

        {/* Status Update — ADMIN / STAFF only */}
        {canChangeStatus && (
          <div className="status-update-section">
            <label htmlFor="status">
              {isAdmin ? "🔧 Admin: Update Status" : "🔧 Update Status"}
            </label>
            <select
              id="status"
              className="status-select"
              value={ticket.status}
              onChange={handleStatusChange}
              disabled={saving}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
            {saving && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>⏳ Updating...</p>}
          </div>
        )}

        {/* Actions */}
        <div className="card-actions">
          <Link to="/tickets" className="btn secondary">← Back</Link>
          {(isAdmin || isOwner) && (
            <Link to={`/tickets/${ticket.id}/edit`} className="btn">✏️ Edit Ticket</Link>
          )}
        </div>
      </div>
    </div>
  );
}