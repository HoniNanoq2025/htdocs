// frontend/src/components/Comments/Comments.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext/AuthContext";
import styles from "./Comments.module.css";

const Comments = ({ pageUrl = "/" }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const API_BASE = "http://localhost:8000/api";

  useEffect(() => {
    if (isAuthenticated) {
      fetchComments();
    }
  }, [isAuthenticated, pageUrl]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/comments.php?page=${encodeURIComponent(pageUrl)}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComments(data.comments);
        } else {
          setError(data.message || "Failed to fetch comments");
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError("Please enter a comment");
      return;
    }

    if (newComment.length > 1000) {
      setError("Comment is too long (max 1000 characters)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/comments.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
          page_url: pageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
      } else {
        setError(data.message || "Failed to add comment");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/comments.php`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: commentId,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  content: content.trim(),
                  updated_at: new Date().toISOString(),
                }
              : comment
          )
        );
        setEditingId(null);
        setEditContent("");
      } else {
        setError(data.message || "Failed to update comment");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/comments.php`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: commentId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
      } else {
        setError(data.message || "Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.commentsSection}>
        <h3 className={styles.title}>Comments</h3>
        <div className={styles.loginPrompt}>
          <p>
            Please{" "}
            <a href="/login" className={styles.loginLink}>
              log in
            </a>{" "}
            to view and post comments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.commentsSection}>
      <h3 className={styles.title}>Comments ({comments.length})</h3>

      {error && <div className={styles.error}>{error}</div>}

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className={styles.commentForm}>
        <div className={styles.formGroup}>
          <label htmlFor="newComment" className={styles.label}>
            Add a comment as {user?.username}:
          </label>
          <textarea
            id="newComment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            className={styles.textarea}
            rows={3}
            maxLength={1000}
            disabled={loading}
          />
          <div className={styles.characterCount}>
            {newComment.length}/1000 characters
          </div>
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || !newComment.trim()}
        >
          {loading ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {/* Comments List */}
      <div className={styles.commentsList}>
        {loading && comments.length === 0 ? (
          <div className={styles.loading}>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className={styles.noComments}>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.username}>{comment.username}</span>
                <span className={styles.timestamp}>
                  {formatDate(comment.created_at)}
                  {comment.updated_at !== comment.created_at && (
                    <span className={styles.edited}> (edited)</span>
                  )}
                </span>
              </div>

              <div className={styles.commentBody}>
                {editingId === comment.id ? (
                  <div className={styles.editForm}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles.editTextarea}
                      rows={3}
                      maxLength={1000}
                    />
                    <div className={styles.editActions}>
                      <button
                        onClick={() =>
                          handleEditComment(comment.id, editContent)
                        }
                        className={styles.saveButton}
                        disabled={loading || !editContent.trim()}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className={styles.cancelButton}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={styles.commentText}>{comment.content}</p>
                    {comment.is_owner && (
                      <div className={styles.commentActions}>
                        <button
                          onClick={() => startEdit(comment)}
                          className={styles.editButton}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className={styles.deleteButton}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
