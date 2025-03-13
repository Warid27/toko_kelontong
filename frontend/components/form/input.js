import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

// Base Floating Label Input
const FloatingLabelInput = ({
  label,
  type,
  name,
  value,
  onChange,
  isTextArea = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      const scrollHeight = textAreaRef.current.scrollHeight;
      const lineHeight = parseFloat(
        getComputedStyle(textAreaRef.current).lineHeight
      );
      const maxHeight = 5 * lineHeight;

      if (scrollHeight > maxHeight) {
        textAreaRef.current.style.height = `${maxHeight}px`;
        setIsScrollable(true);
      } else {
        textAreaRef.current.style.height = `${scrollHeight}px`;
        setIsScrollable(false);
      }

      textAreaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight - 2
      )}px`;
    }
  }, [value]);

  return (
    <div className="relative w-full">
      {isTextArea ? (
        <textarea
          ref={textAreaRef}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(value !== "")}
          className={`break-words peer border-b-2 border-gray-300 w-full bg-transparent text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 p-2 resize-none ${
            isScrollable ? "overflow-y-auto" : "overflow-hidden"
          }`}
          placeholder={label}
          rows={1}
        />
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(value !== "")}
          className="peer placeholder-transparent bg-transparent border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 w-full px-3 py-1"
          placeholder={label}
          required
        />
      )}

      <motion.label
        htmlFor={name}
        initial={{ y: 5, scale: 1.2, opacity: 0.7, left: 16, color: "#6b7280" }}
        animate={
          isFocused || value
            ? { y: -10, scale: 0.85, opacity: 1, color: "#2563eb", left: 0 }
            : {}
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute left-2 text-sm pointer-events-none"
      >
        {label}
      </motion.label>
    </div>
  );
};

// Password Input with Toggle Visibility
export const InputPassword = ({ label, name, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full">
      {/* Password Input Field */}
      <input
        id={name}
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(value !== "")}
        placeholder={label}
        className="peer placeholder-transparent bg-transparent border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 w-full px-3 py-1"
        required
      />

      {/* Floating Label */}
      <motion.label
        htmlFor={name}
        initial={{ y: 5, scale: 1.2, opacity: 0.7, left: 16, color: "#6b7280" }}
        animate={
          isFocused || value
            ? { y: -10, scale: 0.85, opacity: 1, color: "#2563eb", left: 0 }
            : {}
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute left-2 text-sm pointer-events-none"
      >
        {label}
      </motion.label>

      {/* Toggle Password Visibility */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
      </button>
    </div>
  );
};

// Separate Exports
export const InputText = (props) => (
  <FloatingLabelInput {...props} type="text" />
);
export const InputNumber = (props) => (
  <FloatingLabelInput {...props} type="number" />
);
export const InputEmail = (props) => (
  <FloatingLabelInput {...props} type="email" />
);
export const InputFile = (props) => (
  <FloatingLabelInput {...props} type="file" />
);
export const TextArea = (props) => <FloatingLabelInput {...props} isTextArea />;
