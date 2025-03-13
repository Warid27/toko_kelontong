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

// const AddButton = ({ modalOpen }) => {
//   return (
//     <motion.div
//       className="flex flex-row justify-end mt-8"
//       initial={{ y: 20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.4, ease: "easeOut" }}
//     >
//       <button
//         onClick={() => modalOpen("add", true)}
//         className="px-6 py-3 bg-green-400/80 backdrop-blur-lg border border-green-300/30
//                hover:bg-green-500 hover:shadow-green-400/50 text-black font-bold
//                rounded-xl shadow-lg hover:scale-105 transform transition-all
//                duration-300 ease-out flex items-center gap-2 relative overflow-hidden
//                active:scale-95
//                "
//       >
//         <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-30 blur-lg"></span>
//         <span className="relative z-10">+ Tambah Data</span>
//       </button>
//     </motion.div>
//   );
// };

export default Header;
