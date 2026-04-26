import { useEffect, useRef, useState } from "react";
import useAuth from "../../features/auth/hooks/useAuth";
import {
  getComments, addComment, updateComment, deleteComment,
  getAttachments, uploadAttachments, deleteAttachment,
} from "../../api/ticket/ticketApi";

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

// ─── Comments Section ─────────────────────────────────────────────────────────
export function CommentsSection({ ticketId, canCommentAsAdmin = false }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getComments(ticketId)
      .then(setComments)
      .catch((err) => setError(err.message || "Failed to load comments"));
  }, [ticketId]);

  async function handleAdd() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const c = await addComment(ticketId, newComment.trim());
      setComments((prev) => [...prev, c]);
      setNewComment("");
    } catch (err) {
      setError(err.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(commentId) {
    if (!editContent.trim()) return;
    setError("");
    try {
      const updated = await updateComment(ticketId, commentId, editContent.trim());
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Failed to update comment");
    }
  }

  async function handleDelete(commentId) {
    setError("");
    try {
      await deleteComment(ticketId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPendingDeleteId(null);
    } catch (err) {
      setError(err.message || "Failed to delete comment");
    }
  }

  const canModify = (comment) =>
    isAdmin || canCommentAsAdmin || (user && comment.userId === user.id);

  return (
    <div className="details-section">
      <div className="details-section-label">Comments ({comments.length})</div>

      {error && (
        <div className="error-box" style={{ marginBottom: 12 }}>
          <span>Error</span> {error}
        </div>
      )}

      {comments.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 14, marginBottom: 16 }}>
          No comments yet. Be the first to comment.
        </p>
      )}

      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <div className="comment-avatar">
                {c.authorName?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="comment-meta">
                <span className="comment-author">{c.authorName ?? "Unknown"}</span>
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
                    >Edit</button>
                  )}
                  <button
                    className="comment-action-btn danger"
                    onClick={() => setPendingDeleteId(c.id)}
                  >Delete</button>
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
                  <button className="btn" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => handleUpdate(c.id)}>Save</button>
                  <button className="btn secondary" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p className="comment-content">{c.content}</p>
            )}

            {pendingDeleteId === c.id && (
              <div className="admin-panel-section" style={{ marginTop: 10, padding: 10 }}>
                <p className="admin-panel-hint" style={{ marginBottom: 8 }}>Delete this comment?</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn danger" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => handleDelete(c.id)}>
                    Delete
                  </button>
                  <button className="btn secondary" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setPendingDeleteId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
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

// ─── Attachments Section ──────────────────────────────────────────────────────
export function AttachmentsSection({ ticketId, canUpload = true }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [pendingDeleteUrl, setPendingDeleteUrl] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();
  const lightboxImage = lightboxIndex == null ? null : attachments[lightboxIndex];
  const hasMultipleAttachments = attachments.length > 1;

  useEffect(() => {
    setError("");
    setLoading(true);
    getAttachments(ticketId)
      .then(setAttachments)
      .catch((err) => setError(err.message || "Failed to load attachments"))
      .finally(() => setLoading(false));
  }, [ticketId]);

  // Frontend validation catches file mistakes early; backend validation remains the security boundary.
  function validateFiles(files) {
    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      return "A ticket can have at most 3 attachments.";
    }
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return "Only JPEG, PNG, GIF, or WEBP images are allowed.";
      }
      if (file.size > MAX_FILE_SIZE) {
        return "Each attachment must be 5MB or smaller.";
      }
    }
    return "";
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const validationMessage = validateFiles(files);
    if (validationMessage) {
      setError(validationMessage);
      e.target.value = "";
      return;
    }
    setUploading(true);
    setError("");
    try {
      const newOnes = await uploadAttachments(ticketId, files);
      setAttachments((prev) => [...prev, ...(Array.isArray(newOnes) ? newOnes : [newOnes])]);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(attachmentId) {
    setError("");
    try {
      await deleteAttachment(ticketId, attachmentId);
      setAttachments((prev) => prev.filter((a) => a !== attachmentId));
      setPendingDeleteUrl("");
    } catch (err) {
      setError(err.message || "Failed to delete attachment");
    }
  }

  function showPreviousAttachment() {
    setLightboxIndex((current) => {
      if (current == null) return current;
      return current === 0 ? attachments.length - 1 : current - 1;
    });
  }

  function showNextAttachment() {
    setLightboxIndex((current) => {
      if (current == null) return current;
      return current === attachments.length - 1 ? 0 : current + 1;
    });
  }

  return (
    <div className="details-section">
      <div className="details-section-label">Attachments ({loading ? "..." : `${attachments.length}/3`})</div>

      {error && (
        <div className="error-box" style={{ marginBottom: 12 }}>
          <span>Error</span> {error}
        </div>
      )}

      {!loading && attachments.length > 0 ? (
        <div className="attachments-grid">
          {attachments.map((a) => (
            <div key={a} className="attachment-thumb">
              <img
                src={a}
                alt="Attachment"
                onClick={() => setLightboxIndex(attachments.indexOf(a))}
              />
              {canUpload && (
                <button
                  className="attachment-delete-btn"
                  onClick={() => setPendingDeleteUrl(a)}
                  title="Remove"
                >Remove</button>
              )}
              {pendingDeleteUrl === a && (
                <div className="admin-panel-section" style={{ marginTop: 8, padding: 10 }}>
                  <p className="admin-panel-hint" style={{ marginBottom: 8 }}>Remove this image?</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn danger" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => handleDelete(a)}>
                      Remove
                    </button>
                    <button className="btn secondary" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setPendingDeleteUrl("")}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !loading ? (
        <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 14 }}>
          No attachments yet.
        </p>
      ) : null}

      {canUpload && attachments.length < 3 && (
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
            {uploading ? "Uploading..." : "Add Image"}
          </button>
        </>
      )}

      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close attachment preview"
            >
              Close
            </button>
            {hasMultipleAttachments && (
              <button
                type="button"
                className="lightbox-nav lightbox-nav-prev"
                onClick={showPreviousAttachment}
                aria-label="Previous attachment"
              >
                ‹
              </button>
            )}
            <img src={lightboxImage} alt="Attachment preview" className="lightbox-img" />
            {hasMultipleAttachments && (
              <button
                type="button"
                className="lightbox-nav lightbox-nav-next"
                onClick={showNextAttachment}
                aria-label="Next attachment"
              >
                ›
              </button>
            )}
            {hasMultipleAttachments && (
              <div className="lightbox-count">
                {lightboxIndex + 1} / {attachments.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
