import React, { useState } from "react";
import { Modal } from "@/components/Modal"; // Adjust the path based on your folder structure

const Coba = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button
        onClick={openModal}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Open Modal
      </button>

      {/* Conditionally render the Modal */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold">Hello, I am a modal!</h2>
          <p>This is the content inside the modal.</p>
        </Modal>
      )}
    </div>
  );
};

export default Coba;
