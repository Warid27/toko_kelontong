"use client";
import { useState, useEffect } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
  LocalizationProvider,
  DateTimePicker as MuiDateTimePicker,
} from "@mui/x-date-pickers";

export default function DateTimePicker({
  value, // Tanggal awal yang diterima dari parent
  onChange, // Fungsi untuk mengirim perubahan ke parent
  name, // Nama field (start_date atau end_date)
  format = "yyyy-MM-dd HH:mm", // Format default
  minDate, // Tanggal minimum (opsional)
  className = "border p-2 rounded bg-white w-full", // Default class
}) {
  const [date, setDate] = useState(value ? new Date(value) : null);

  // Sinkronkan state internal dengan props value jika ada perubahan dari parent
  useEffect(() => {
    setDate(value ? new Date(value) : null);
  }, [value]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate); // Kirim tanggal baru ke parent
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDateTimePicker
        value={date}
        onChange={handleDateChange}
        format={format}
        minDate={minDate ? new Date(minDate) : undefined}
        slotProps={{
          textField: {
            className: className,
            variant: "outlined",
          },
        }}
      />
    </LocalizationProvider>
  );
}
