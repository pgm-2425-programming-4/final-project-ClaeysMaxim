import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAssignees, deleteAssignee } from "../api/assigneeApi";
import { API_URL } from "../constants/constants";
import AssigneeForm from "../components/assignees/AssigneeForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";

function AssigneesComponent() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    assignee: null,
  });

  const { data: assigneesData, isLoading, error } = useQuery({
    queryKey: ["assignees"],
    queryFn: fetchAssignees,
  });

  const handleAddClick = () => {
    setSelectedAssignee(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (assignee) => {
    setSelectedAssignee(assignee);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAssignee(null);
    queryClient.invalidateQueries(["assignees"]);
  };

  const handleDeleteClick = (assignee) => {
    setConfirmDialog({
      isOpen: true,
      assignee: assignee,
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.assignee) {
      try {
        await deleteAssignee(confirmDialog.assignee);
        queryClient.invalidateQueries(["assignees"]);
        setConfirmDialog({ isOpen: false, assignee: null });
      } catch (error) {
        console.error("Delete failed:", error);
        setConfirmDialog({ isOpen: false, assignee: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, assignee: null });
  };

  if (isLoading) return <div className="loading">Loading assignees...</div>;
  if (error) return <div className="error">Error loading assignees</div>;

  return (
    <>
      <header className="header">
        <div className="header__project">
          <h1 className="header__title">Manage Assignees</h1>
          <span className="header__subtitle">Team member management</span>
        </div>
        <div className="header__actions">
          <button
            className="button button--primary"
            onClick={handleAddClick}
          >
            <span className="icon">
              <img src="/styles/images/icons/plus.svg" alt="Add" />
            </span>
            Add Assignee
          </button>
        </div>
      </header>

      <div className="backlog">
        {assigneesData?.data?.length === 0 ? (
          <div className="empty-message">
            No assignees found. Add your first team member!
          </div>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assigneesData?.data?.map((assignee) => {
                const displayName = assignee.displayName || "Unnamed";
                const avatarUrl = assignee.avatar?.url;
                const fullAvatarUrl = avatarUrl ? 
                  (avatarUrl.startsWith('http') ? avatarUrl : `${API_URL.replace('/api', '')}${avatarUrl}`) : 
                  null;
                
                return (
                  <tr key={assignee.documentId} className="task-row">
                    <td>
                      <div className="task-card__avatar">
                        {fullAvatarUrl ? (
                          <img src={fullAvatarUrl} alt={displayName} />
                        ) : (
                          displayName.substring(0, 2).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td>{displayName}</td>
                    <td>
                      <button
                        onClick={() => handleEditClick(assignee)}
                        className="button button--small button--primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(assignee)}
                        className="button button--small button--danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <AssigneeForm
          assignee={selectedAssignee}
          onClose={handleCloseForm}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Assignee"
        message={`Are you sure you want to delete "${confirmDialog.assignee?.displayName || "this assignee"}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

export const Route = createFileRoute("/assignees")({
  component: AssigneesComponent,
});
