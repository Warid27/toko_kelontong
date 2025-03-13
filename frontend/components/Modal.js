import React from "react";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

export const Modal = ({
  title,
  children,
  onClose,
  isOpen,
  width = "small",
}) => {
  let maxWidth;
  switch (width) {
    case "large":
      maxWidth = "sm:max-w-4xl";
      break;
    case "medium":
      maxWidth = "sm:max-w-2xl";
      break;
    case "small":
    default:
      maxWidth = "sm:max-w-lg";
      break;
  }

  // Animation variants for the overlay
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Animation variants for the modal
  const modalVariants = {
    hidden: {
      scale: 0.7,
      opacity: 0,
      y: 50,
      rotateX: 15,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      },
    },
    exit: {
      scale: 0.7,
      opacity: 0,
      y: 50,
      rotateX: -15,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          transition={{ duration: 0.3 }}
        >
          {/* Background Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            variants={overlayVariants}
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className={`relative bg-white rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-hidden`}
            variants={modalVariants}
          >
            {/* Header (Sticky) */}
            <div className="flex justify-between items-center p-4 border-b">
              <motion.h2
                className="text-xl font-semibold text-gray-900"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h2>
              <motion.button
                onClick={onClose}
                className="iconBtn iconCloseBtn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IoClose className="text-2xl" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <motion.div
              className="p-4 overflow-y-auto max-h-[70vh]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
