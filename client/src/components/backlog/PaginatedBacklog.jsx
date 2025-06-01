import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../../api/taskApi";
import Backlog from "./Backlog";
import Pagination from "./Pagination";

const PaginatedBacklog = ({ projectId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset to page 1 when project changes
  useEffect(() => {
    setCurrentPage(1);
  }, [projectId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", currentPage, projectId],
    queryFn: () => fetchTasks(currentPage, pageSize, projectId),
    enabled: !!projectId,
  });

  const handlePageChanged = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = data?.meta?.pagination?.pageCount || 1;

  if (!projectId) {
    return <div>Select a project to view tasks</div>;
  }

  return (
    <section className="backlog">
      <div className="backlog__header">
        <h2 className="backlog__title">Task Backlog</h2>
      </div>

      {isLoading ? (
        <div>Loading tasks...</div>
      ) : error ? (
        <div>Error loading tasks: {error.message}</div>
      ) : data?.data?.length === 0 ? (
        <div>No tasks found for this project.</div>
      ) : (
        <Backlog tasks={data?.data || []} />
      )}

      {data?.data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChanged={handlePageChanged}
        />
      )}
    </section>
  );
};

export default PaginatedBacklog;
