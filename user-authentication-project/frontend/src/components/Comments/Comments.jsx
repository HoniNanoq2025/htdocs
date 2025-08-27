// frontend/src/components/Comments/Comments.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext/AuthContext";
import styles from "./Comments.module.css";

// Kommentar komponent
// Håndterer visning, tilføjelse, redigering og sletning af kommentarer
const Comments = ({ pageUrl = "/" }) => {
  // Tjekker om brugeren er logget ind
  const { user, isAuthenticated } = useAuth();

  // useState hooks til at håndtere komponentens tilstand
  const [comments, setComments] = useState([]); // start med et tomt array
  const [newComment, setNewComment] = useState(""); // start med tom string-værdi
  const [loading, setLoading] = useState(false); // Loading er "slukket" indtil den sættes til true
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null); // null signalerer at der ikke er data nu, men det kommer senere
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  // null signalerer “intet endnu”
  // Andre tomme værdier ("", [], {}) signalerer typisk “vi har data, men den er tom”.

  // API base URL
  const API_BASE = "http://localhost:8000/api";

  // Hent kommentarer når komponenten mountes eller pageUrl ændres
  useEffect(() => {
    if (isAuthenticated) {
      fetchComments();
    }
  }, [isAuthenticated, pageUrl]);

  // async funktion til at hente kommentarer fra backend
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/comments.php?page=${encodeURIComponent(pageUrl)}`,
        {
          credentials: "include", // Inkluder cookies til session håndtering
          headers: {
            "Content-Type": "application/json",
          }, // Angiv JSON som forventet format
        }
      );

      // Tjek om response er ok (status 200-299)
      if (response.ok) {
        const data = await response.json();
        // Hvis success er true, opdater kommentarer
        if (data.success) {
          setComments(data.comments);
        } else {
          setError(data.message || "Failed to fetch comments");
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Error fetching comments:", err); // Log fejl til konsollen
      setError("Failed to load comments"); // Vis generisk fejlbesked
    } finally {
      setLoading(false); // Stop loading state når fetch er færdig
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

  const startReply = (comment) => {
    setReplyingTo(comment.id);
    setReplyContent(`@${comment.username} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const handleReply = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      setError("Please enter a reply");
      return;
    }

    if (replyContent.length > 1000) {
      setError("Reply is too long (max 1000 characters)");
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
          content: replyContent.trim(),
          page_url: pageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setReplyingTo(null);
        setReplyContent("");
      } else {
        setError(data.message || "Failed to add reply");
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      setError("Failed to add reply");
    } finally {
      setLoading(false);
    }
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
          {/* prettier-ignore */}
          <p>
            Please <a href="/login" className={styles.loginLink}>log in</a> to view and post comments.
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

                    {/* Action buttons - only show if not currently replying to this comment */}
                    {replyingTo !== comment.id && (
                      <div className={styles.commentActions}>
                        {comment.is_owner ? (
                          // Show Edit/Delete for comment owner
                          <>
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
                          </>
                        ) : (
                          // Show Reply for other users' comments
                          <button
                            onClick={() => startReply(comment)}
                            className={styles.replyButton}
                            disabled={loading}
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <form onSubmit={handleReply} className={styles.replyForm}>
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`Reply to ${comment.username}...`}
                          className={styles.replyTextarea}
                          rows={2}
                          maxLength={1000}
                          disabled={loading}
                        />
                        <div className={styles.replyActions}>
                          <button
                            type="submit"
                            className={styles.replySubmitButton}
                            disabled={loading || !replyContent.trim()}
                          >
                            {loading ? "Replying..." : "Reply"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelReply}
                            className={styles.cancelButton}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
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
