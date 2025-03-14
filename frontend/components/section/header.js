import { IoSearchOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { AddButton } from "@/components/form/button";

const Header = ({
  // YUD YUD
  searchQuery,
  isSearch = false,
  isAdd = false,
  setSearchQuery,
  modalOpen,
  title,
  subtitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col w-full bg-gradient-to-r from-white-500 to-white-800 shadow-xl p-6 rounded-lg text-black"
    >
      <div className="flex flex-row justify-between items-center">
        <div>
          <motion.p
            className="text-3xl font-extrabold drop-shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {title}
          </motion.p>
          <motion.p
            className="text-lg opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {subtitle}
          </motion.p>
          {isSearch && (
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
        </div>

        {isAdd && (
          <div className="flex flex-row justify-end mt-8">
            <AddButton onClick={() => modalOpen("add", true)} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <motion.div
      className="relative mt-2 flex flex-row space-x-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className="relative w-full max-w-xs"
        whileHover={{ scale: 1.05 }}
        whileFocus={{ scale: 1.1 }}
      >
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 pr-4 py-2 rounded-xl font-semibold w-full bg-white/30 shadow-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
        />
        <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-gray-500" />
      </motion.div>
    </motion.div>
  );
};


export default Header;
