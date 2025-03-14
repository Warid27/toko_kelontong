import { motion } from "framer-motion";

export const BaseButton = ({
  onClick = () => {},
  content,
  type = "button",
  bgColor = "var(--bg-primary)",
  gradient = "bg-gradient-to-r bg-[var(--bg-primary)]",
}) => {
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
        className={`px-6 py-3 bg-[${bgColor}] backdrop-blur-lg border border-[${bgColor}] 
                   hover:bg-[${bgColor}] hover:shadow-black text-white font-bold 
                   rounded-xl shadow-md hover:scale-105 transform transition-all 
                   duration-300 ease-out flex items-center gap-2 relative overflow-hidden
                   active:scale-95 active:shadow-black/50`}
      >
        <span
          className={`absolute inset-0 ${gradient} opacity-50 hover:opacity-100 blur-lg`}
        ></span>
        <span className="relative z-10">{content}</span>
      </button>
    </motion.div>
  );
};

export const AddButton = ({ onClick, content = "+ Tambah Data" }) => (
  <BaseButton
    onClick={onClick}
    content={content}
    bgColor="var(--bg-primary)"
    gradient="bg-gradient-to-r bg-[var(--bg-primary)]"
  />
);

export const SubmitButton = ({
  onClick = () => {},
  content = "Submit",
  type = "submit",
}) => (
  <BaseButton
    onClick={onClick}
    type={type}
    content={content}
    bgColor="var(--bg-secondary)"
    gradient="bg-gradient-to-r bg-[var(--bg-secondary)]"
  />
);

export const CloseButton = ({ onClick, content = "Cancel" }) => (
  <BaseButton
    onClick={onClick}
    content={content}
    bgColor="var(--bg-tertiary)"
    gradient="bg-gradient-to-r bg-[var(--bg-tertiary)]"
  />
);

export const DangerButton = ({ onClick, content = "danger" }) => (
  <BaseButton
    onClick={onClick}
    content={content}
    bgColor="var(--bg-danger)"
    gradient="bg-gradient-to-r bg-[var(--bg-danger)]"
  />
);
