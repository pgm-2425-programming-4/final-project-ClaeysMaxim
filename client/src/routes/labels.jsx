import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLabels, createLabel, deleteLabel } from "../api/labelApi";
import ConfirmDialog from "../components/ui/ConfirmDialog";

function LabelsComponent() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState("");
  const [labelToDelete, setLabelToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: labelsData, isLoading, error: fetchError } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });

  const createLabelMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      queryClient.invalidateQueries(["labels"]);
      handleCloseForm();
    },
    onError: (err) => {
      setError("Error creating label. Please try again.");
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: deleteLabel,
    onSuccess: () => {
      queryClient.invalidateQueries(["labels"]);
      queryClient.invalidateQueries(["tasks"]);
      setIsDeleteDialogOpen(false);
      setLabelToDelete(null);
    },
    onError: (err) => {
      setError("Error deleting label. Please try again.");
      setIsDeleteDialogOpen(false);
      setLabelToDelete(null);
    },
  });

  const handleAddClick = () => {
    setFormData({ name: "" });
    setIsFormOpen(true);
    setError("");
  };

  const handleDeleteClick = (label) => {
    setLabelToDelete(label);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData({ name: "" });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Label name is required");
      return;
    }

    createLabelMutation.mutate({
      data: { name: formData.name }
    });
  };

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleDeleteConfirm = () => {
    if (labelToDelete) {
      deleteLabelMutation.mutate(labelToDelete);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setLabelToDelete(null);
  };

  if (isLoading) return <div className="loading">Loading labels...</div>;
  if (fetchError) return <div className="error">Error loading labels</div>;

  return (
    <>
      <header className="header">
        <div className="header__project">
          <h1 className="header__title">Manage Labels</h1>
          <span className="header__subtitle">Label management</span>
        </div>
        <div className="header__actions">
          <button
            className="button button--primary"
            onClick={handleAddClick}
          >
            <span className="icon">
              <img src="/styles/images/icons/plus.svg" alt="Add" />
            </span>
            Add Label
          </button>
        </div>
      </header>

      <div className="backlog">
        {labelsData?.data?.length === 0 ? (
          <div className="empty-message">
            No labels found. Add your first label!
          </div>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labelsData?.data?.map((label) => (
                <tr key={label.id} className="task-row">
                  <td>{label.id}</td>
                  <td>
                    <span className="label-badge">{label.name}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteClick(label)}
                      className="button button--small button--danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <div className="add-task-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) handleCloseForm();
        }}>
          <div className="add-task">
            <div className="add-task__header">
              <h2 className="add-task__title">Add New Label</h2>
              <button className="add-task__close" onClick={handleCloseForm}>×</button>
            </div>
            <div className="add-task__body">
              {error && <div className="add-task-form__error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="add-task-form__group">
                  <label className="add-task-form__label" htmlFor="name">
                    Label Name *
                  </label>
                  <input
                    className="add-task-form__control"
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="add-task__footer">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="button button--secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLabelMutation.isPending}
                    className="button button--primary"
                  >
                    {createLabelMutation.isPending ? "Saving..." : "Save Label"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Label"
        message={`Are you sure you want to delete "${labelToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
export const Route = createFileRoute("/labels")({
  component: LabelsComponent,
});