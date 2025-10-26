import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  disabled?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  disabled = false,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    onItemsPerPageChange(newItemsPerPage);
  };

  const generatePageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage: number;
      let endPage: number;

      if (currentPage <= 4) {
        // Near the beginning
        startPage = 2;
        endPage = 5;
        pages.push(2, 3, 4, 5);
        if (totalPages > 5) {
          pages.push("...");
        }
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        if (totalPages > 5) {
          pages.push("...");
        }
        startPage = totalPages - 3;
        endPage = totalPages - 1;
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        startPage = currentPage - 1;
        endPage = currentPage + 1;
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="pagination-controls">
      <div className="pagination-navigation">
        <div className="items-per-page">
          <label htmlFor="items-per-page">Items per page:</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            disabled={disabled}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {totalPages > 1 && (
          <div className="page-navigation">
            <button
              className="pagination-button previous"
              onClick={handlePrevious}
              disabled={disabled || currentPage === 1}
              aria-label="Go to previous page"
            >
              ← Previous
            </button>

            <div className="page-numbers">
              {generatePageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="pagination-ellipsis"
                    >
                      ...
                    </span>
                  );
                }

                const pageNumber = page as number;
                return (
                  <button
                    key={pageNumber}
                    className={`pagination-button page-number ${
                      currentPage === pageNumber ? "active" : ""
                    }`}
                    onClick={() => handlePageClick(pageNumber)}
                    disabled={disabled}
                    aria-label={`Go to page ${pageNumber}`}
                    aria-current={
                      currentPage === pageNumber ? "page" : undefined
                    }
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              className="pagination-button next"
              onClick={handleNext}
              disabled={disabled || currentPage === totalPages}
              aria-label="Go to next page"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginationControls;
