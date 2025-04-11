import { FiMenu, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import useUserStore from "@/stores/user-store";

export const SidebarToggle = () => {
  const { isSidebarOpen, updateSidebarOpen } = useUserStore();

  return (
    <motion.button
      className="flex items-center justify-center rounded-md p-2 focus:outline-none "
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={() => updateSidebarOpen(!isSidebarOpen)}
      aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isSidebarOpen ? 90 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </motion.div>
    </motion.button>
  );
};
