import { motion } from "framer-motion";

export const BaseIcon = ({
  onClick,
  content,
  type = "button",
  textColor = "var(--bg-primary)",
  gradient = "text-gradient-to-r",
}) => {
  return (
    <motion.div
      className="flex flex-row justify-end m-1"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <button onClick={onClick} type={type}>
        <span
          className={`absolute inset-0 ${gradient} opacity-50 hover:opacity-100 blur-lg`}
        ></span>
        <span
          className={`relative z-10 text-2xl font-bold backdrop-blur-lg
             hover:scale-105 transform transition-all duration-300 ease-out 
             flex items-center overflow-hidden active:scale-95`}
          style={{
            color: textColor,
            textShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)", // Adjust shadow intensity
          }}
        >
          {content}
        </span>
      </button>
    </motion.div>
  );
};

export const AddIcon = ({ onClick, content = "+" }) => (
  <BaseIcon onClick={onClick} content={content} />
);

export const SubmitIcon = ({ onClick, type = "button", content = "?" }) => (
  <BaseIcon
    onClick={onClick}
    type={type}
    content={content}
    textColor="var(--bg-secondary)"
  />
);

export const CloseIcon = ({ onClick, content = "X" }) => (
  <BaseIcon
    onClick={onClick}
    content={content}
    textColor="var(--bg-tertiary)"
  />
);

export const DangerIcon = ({ onClick, content = "!" }) => (
  <BaseIcon onClick={onClick} content={content} textColor="var(--bg-danger)" />
);
