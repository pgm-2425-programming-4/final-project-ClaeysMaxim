import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChanged }) => {
  const handlePageClick = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    onPageChanged(pageNumber);
  };

  const renderPaginationItems = () => {
    const items = [];

    // Less than or equal to 6 pages - show all buttons
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(renderPaginationItem(i));
      }
      return items;
    }

    // More than 6 pages
    // Current page is 1, 2, or 3
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        items.push(renderPaginationItem(i));
      }
      items.push(renderEllipsis());
      items.push(renderPaginationItem(totalPages));
      return items;
    }

    // Current page is among the last three pages
    if (currentPage >= totalPages - 2) {
      items.push(renderPaginationItem(1));
      items.push(renderEllipsis());
      for (let i = totalPages - 3; i <= totalPages; i++) {
        items.push(renderPaginationItem(i));
      }
      return items;
    }

    // Current page is in the middle
    items.push(renderPaginationItem(1));
    items.push(renderEllipsis());
    items.push(renderPaginationItem(currentPage - 1));
    items.push(renderPaginationItem(currentPage));
    items.push(renderPaginationItem(currentPage + 1));
    items.push(renderEllipsis());
    items.push(renderPaginationItem(totalPages));
    return items;
  };

  const renderPaginationItem = (pageNumber) => (
    <span
      key={pageNumber}
      className={`pagination__page ${
        currentPage === pageNumber ? "pagination__page--active" : ""
      }`}
      onClick={() => handlePageClick(pageNumber)}
    >
      {pageNumber}
    </span>
  );

  const renderEllipsis = () => (
    <span key={`ellipsis-${Math.random()}`} className="pagination__ellipsis">
      &hellip;
    </span>
  );

  return (
    <div className="pagination">
      <button
        className="pagination__button pagination__button--prev"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo; Previous
      </button>

      <div className="pagination__pages">{renderPaginationItems()}</div>

      <button
        className="pagination__button pagination__button--next"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &raquo;
      </button>
    </div>
  );
};

export default Pagination;
