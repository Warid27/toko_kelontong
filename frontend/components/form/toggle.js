import React from 'react';

/**
 * GreenToggle - A stylish green-themed toggle switch component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isChecked - Current state of the toggle
 * @param {function} props.onChange - Function to handle state change
 * @param {string} props.label - Label text for the toggle
 * @param {string} props.name - Name attribute for form submission
 * @param {string} props.checkedText - Text to display when toggle is on (default: "Yes")
 * @param {string} props.uncheckedText - Text to display when toggle is off (default: "No")
 */
const Toggle = ({ 
  isChecked, 
  onChange, 
  label, 
  name, 
  checkedText = "Yes", 
  uncheckedText = "No" 
}) => {
  const handleToggle = () => {
    onChange({
      target: {
        name: name,
        value: isChecked ? 0 : 1
      }
    });
  };

  return (
    <div>
      {label && <p className="font-semibold mb-2">{label}</p>}
      <div className="flex items-center">
        <div 
          className="relative w-14 h-7 cursor-pointer"
          onClick={handleToggle}
        >
          <input 
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={() => {}}
            name={name}
          />
          <div className={`w-full h-full rounded-full transition-colors duration-300 ease-in-out ${isChecked ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ease-in-out shadow-md ${isChecked ? 'translate-x-7' : 'translate-x-0'}`}></div>
        </div>
        <span className="ml-3">
          {isChecked ? (
            <span className="text-green-600 font-medium">{checkedText}</span>
          ) : (
            <span className="text-gray-600">{uncheckedText}</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default Toggle;