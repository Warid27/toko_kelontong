import { Pagination } from "@mui/material";

const PaginationComponent = ({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage, 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null; // Hide pagination if only 1 page

  return (
    <div className="flex justify-center mt-4">
      <Pagination
        count={totalPages}
        page={currentPage + 1} // MUI Pagination is 1-based, while your state is 0-based
        onChange={(_, page) => setCurrentPage(page - 1)}
        variant="outlined"
        shape="rounded"
        color="primary"
      />
    </div>
  );
};

export default PaginationComponent;
