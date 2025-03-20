"use client";
import { useState, useEffect, useRef } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
  LocalizationProvider,
  DatePicker,
  StaticTimePicker,
} from "@mui/x-date-pickers";
import { motion } from "framer-motion";
import { Modal, Box } from "@mui/material";

export default function DateTimePicker({
  value, // Initial date received from parent
  onChange, // Function to send changes to parent
  onError, // Function to communicate error state to parent
  name, // Field name (start_date or end_date)
  format = "yyyy-MM-dd HH:mm", // Default format
  minDate, // Minimum date (optional)
  className = "border p-2 rounded bg-white w-full", // Default class
  required = false, // Whether the field is required
}) {
  const [date, setDate] = useState(value ? new Date(value) : null);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const datePickerRef = useRef(null);

  // Synchronize internal state with props value if there are changes from parent
  useEffect(() => {
    setDate(value ? new Date(value) : null);
  }, [value]);

  // Check if date is valid compared to minDate
  useEffect(() => {
    let hasError = false;
    let message = "";

    if (required && !date) {
      hasError = true;
      message = "This field is required";
    } else if (date && minDate && new Date(date) < new Date(minDate)) {
      hasError = true;
      message = `Date cannot be before ${formatDisplayDate(new Date(minDate))}`;
    }

    setError(hasError);
    setErrorMessage(message);

    // Communicate error state to parent
    if (onError) {
      onError(name, hasError, message);
    }
  }, [date, minDate, required, name, onError]);

  const handleDateChange = (newDate) => {
    if (!newDate) {
      setDate(null);
      if (onChange) {
        onChange(null, name);
      }
      return;
    }

    // Preserve time if already set
    let updatedDate;
    if (date) {
      updatedDate = new Date(newDate);
      updatedDate.setHours(
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      );
    } else {
      updatedDate = newDate;
      // Set default time to 00:00
      updatedDate.setHours(0, 0, 0, 0);
    }

    setDate(updatedDate);

    // Only open time picker if we have a valid date
    if (newDate) {
      setOpenTimePicker(true);
    }

    if (onChange) {
      onChange(updatedDate, name);
    }
  };

  const handleTimeChange = (newDateTime) => {
    setDate(newDateTime);
    setOpenTimePicker(false);

    if (onChange) {
      onChange(newDateTime, name);
    }
  };

  // Format the display date with time
  const formatDisplayDate = (date) => {
    if (!date) return "";

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    return new Intl.DateTimeFormat("en-US", options)
      .format(date)
      .replace(",", "");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="relative">
        <DatePicker
          ref={datePickerRef}
          value={date}
          onChange={handleDateChange}
          minDate={minDate ? new Date(minDate) : undefined}
          slotProps={{
            textField: {
              className: `${className} ${error ? "border-red-500" : ""}`,
              variant: "outlined",
              placeholder: "Select date",
              fullWidth: true,
              error: error,
              required: required,
              helperText: errorMessage,
              inputProps: {
                value: date ? formatDisplayDate(date) : "",
                readOnly: true,
              },
            },
          }}
        />

        {/* {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm mt-1"
          >
            {errorMessage}
          </motion.div>
        )} */}

        <Modal
          open={openTimePicker}
          onClose={() => setOpenTimePicker(false)}
          aria-labelledby="time-picker-modal"
          aria-describedby="select-time"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              borderRadius: 1,
              boxShadow: 24,
              p: 2,
              maxWidth: 360,
              width: "100%",
            }}
          >
            <StaticTimePicker
              value={date}
              onChange={handleTimeChange}
              orientation="portrait"
              ampm={false}
            />
          </Box>
        </Modal>
      </div>
    </LocalizationProvider>
  );
}
