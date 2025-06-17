import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createAssignee, updateAssignee } from "../../api/assigneeApi";
import { uploadFile } from "../../api/uploadApi";
import { API_URL } from "../../constants/constants";

function AssigneeForm({ assignee, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!assignee;

  const [formData, setFormData] = useState({
    displayName: assignee?.displayName || "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    assignee?.avatar?.url ? 
      (assignee.avatar.url.startsWith('http') ? 
        assignee.avatar.url : 
        `${API_URL.replace('/api', '')}${assignee.avatar.url}`) : 
      null
  );
  const [avatarToDelete, setAvatarToDelete] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAvatarToDelete(false); // Reset delete flag when new file selected
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAvatarToDelete(true); // Mark existing avatar for deletion
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarId = null;
      
      if (selectedFile) {
        const uploadedFile = await uploadFile(selectedFile);
        avatarId = uploadedFile.id;
      }

      if (isEditing) {
        await updateAssignee(assignee, {
          displayName: formData.displayName,
          avatar: avatarToDelete ? null : (avatarId || assignee?.avatar?.id || null),
        });
      } else {
        await createAssignee({
          data: {
            displayName: formData.displayName,
            avatar: avatarId,
          },
        });
      }

      queryClient.invalidateQueries(["assignees"]);
      onClose();
    } catch (err) {
      setError(isEditing ? "Error updating assignee. Please try again." : "Error creating assignee. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-task-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="add-task">
        <div className="add-task__header">
          <h2 className="add-task__title">
            {isEditing ? "Edit Assignee" : "Add New Assignee"}
          </h2>
          <button className="add-task__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="add-task__body">
          {error && <div className="add-task-form__error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="displayName">
                Display Name *
              </label>
              <input
                className="add-task-form__control"
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="avatar">
                Avatar Image
              </label>
              <input
                className="add-task-form__control"
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewUrl && (
                <div className="assignee-form__avatar-preview">
                  <div className="assignee-avatar--large">
                    <img src={previewUrl} alt="Avatar preview" />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="button button--danger button--small"
                    style={{ marginTop: "10px" }}
                  >
                    Remove Avatar
                  </button>
                </div>
              )}
            </div>

            <div className="add-task__footer">
              <button
                type="button"
                onClick={onClose}
                className="button button--secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="button button--primary"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Assignee" : "Create Assignee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssigneeForm;
