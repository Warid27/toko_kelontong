import { motion } from "framer-motion";

export const BaseMenu = ({
  onClick = () => {},
  content,
  type = "button",
  isActive = false,
  size = "small",
  bgColor = "var(--bg-tertiary)", // Default background color
}) => {
  const gradient = `bg-gradient-to-r from-[${bgColor}] to-[${bgColor}]`;
  let sized;
  let text_size;
  switch (size) {
    case "big":
      sized = "w-24 h-24";
      text_size = "text-3xl";
      break;
    case "medium":
      sized = "w-24 h-12";
      text_size = "text-lg";
      break;
    case "small":
      sized = "w-12 h-12";
      text_size = "text-3xl";
      break;
    default:
      break;
  }

  return (
    <motion.div
      className="flex flex-row justify-end m-1"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <button
        onClick={onClick}
        type={type}
        style={{ backgroundColor: isActive ? "var(--bg-primary)" : bgColor }} // ✅ Use inline styles
        className={`${sized}  backdrop-blur-lg border text-white font-bold 
                   rounded-xl shadow-md hover:scale-105 transform transition-all 
                   duration-300 ease-out flex items-center justify-center relative overflow-hidden
                   active:scale-95 active:shadow-black/50`}
      >
        <span
          className={`absolute inset-0 ${gradient} opacity-50 hover:opacity-100 blur-lg`}
        ></span>
        <span className={`relative z-10 ${text_size}`}>{content}</span>
      </button>
    </motion.div>
  );
};

export const AddMenu = ({
  onClick,
  content = "?",
  size = "small",
  isActive = false,
}) => (
  <BaseMenu
    onClick={onClick}
    size={size}
    content={content}
    isActive={isActive}
  />
);

export const SubmitMenu = ({ content = "Submit" }) => (
  <BaseMenu
    type="submit"
    content={content}
    bgColor="var(--bg-secondary)"
    gradient="bg-gradient-to-r bg-[var(--bg-secondary)]"
  />
);

export const CloseMenu = ({ onClick, content = "Cancel" }) => (
  <BaseMenu
    onClick={onClick}
    content={content}
    bgColor="var(--bg-tertiary)"
    gradient="bg-gradient-to-r bg-[var(--bg-tertiary)]"
  />
);

export const DangerMenu = ({ onClick, content = "danger" }) => (
  <BaseMenu
    onClick={onClick}
    content={content}
    bgColor="var(--bg-danger)"
    gradient="bg-gradient-to-r bg-[var(--bg-danger)]"
  />
);
