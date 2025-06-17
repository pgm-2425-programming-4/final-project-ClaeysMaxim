import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../../api/taskApi";
import { PAGE_SIZE_OPTIONS } from "../../constants/constants";
import Backlog from "./Backlog";
import Pagination from "./Pagination";

const PaginatedBacklog = ({ projectId, project }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 when project or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [projectId, pageSize]);

  // Make sure projectId is a number for the API
  const numericProjectId =
    typeof projectId === "string" ? parseInt(projectId, 10) : projectId;

  // Fetch ALL tasks for the project (we'll filter client-side)
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", numericProjectId],
    queryFn: () => fetchTasks(1, 1000, numericProjectId), // Get all tasks
    enabled: !!numericProjectId,
  });

  // Filter tasks to only show backlog status
  const backlogTasks = data?.data?.filter((task) => {
    const statusName = task.taskStatus?.name;
    return statusName?.toLowerCase() === "backlog";
  }) || [];

  // Client-side pagination
  const totalItems = backlogTasks.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = backlogTasks.slice(startIndex, endIndex);

  const handlePageChanged = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePageSizeChanged = (newPageSize) => {
    setPageSize(newPageSize);
  };

  if (!projectId) {
    return <div>Select a project to view tasks</div>;
  }

  return (
    <section className="backlog">
      <div className="backlog__header">
        <h2 className="backlog__title">Task Backlog</h2>
        <p className="backlog__subtitle">Tasks awaiting assignment to sprint</p>
      </div>

      {isLoading ? (
        <div>Loading tasks...</div>
      ) : error ? (
        <div>Error loading tasks: {error.message}</div>
      ) : backlogTasks.length === 0 ? (
        <div className="empty-message">No tasks in backlog for this project.</div>
      ) : (
        <Backlog tasks={paginatedTasks} project={project} projectId={projectId} />
      )}

      {backlogTasks.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChanged={handlePageChanged}
          onPageSizeChanged={handlePageSizeChanged}
        />
      )}
    </section>
  );
};

export default PaginatedBacklog;
