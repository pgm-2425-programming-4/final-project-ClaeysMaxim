import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../../api/taskApi";
import Backlog from "./Backlog";
import Pagination from "./Pagination";

const PaginatedBacklog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", currentPage],
    queryFn: () => fetchTasks(currentPage, pageSize),
  });

  const handlePageChanged = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = data?.meta?.pagination?.pageCount || 1;

  return (
    <section className="backlog">
      <div className="backlog__header">
        <h2 className="backlog__title">Task Backlog</h2>
      </div>

      {isLoading ? (
        <div>Loading tasks...</div>
      ) : error ? (
        <div className="backlog__error">
          Error loading tasks: {error.message}
        </div>
      ) : (
        <Backlog tasks={data?.data || []} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChanged={handlePageChanged}
      />
    </section>
  );
};

export default PaginatedBacklog;
