import { useEffect, useRef, useState } from "react";
import useAuth from "../../features/auth/hooks/useAuth";
import {
  getComments, addComment, updateComment, deleteComment,
  getAttachments, uploadAttachments, deleteAttachment,
} from "../../api/ticket/ticketApi";

// ─── Comments Section ─────────────────────────────────────────────────────────
export function CommentsSection({ ticketId, canCommentAsAdmin = false }) {
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
    isAdmin || canCommentAsAdmin || (user && comment.userId === user.id);

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
                    >✏️</button>
                  )}
                  <button
                    className="comment-action-btn danger"
                    onClick={() => handleDelete(c.id)}
                  >🗑️</button>
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
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    getAttachments(ticketId)
      .then(setAttachments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ticketId]);

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
      setAttachments((prev) => [...prev, ...(Array.isArray(newOnes) ? newOnes : [newOnes])]);
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
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      alert(err.message || "Failed to delete attachment");
    }
  }

  return (
    <div className="details-section">
      <div className="details-section-label">📎 Attachments ({loading ? "…" : `${attachments.length}/3`})</div>

      {!loading && attachments.length > 0 ? (
        <div className="attachments-grid">
          {attachments.map((a) => (
            <div key={a.id} className="attachment-thumb">
              <img
                src={a.fileUrl}
                alt="Attachment"
                onClick={() => setLightbox(a.fileUrl)}
              />
              {canUpload && (
                <button
                  className="attachment-delete-btn"
                  onClick={() => handleDelete(a.id)}
                  title="Remove"
                >✕</button>
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
