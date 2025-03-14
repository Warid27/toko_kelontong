"use client";
import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, MonthPicker, YearPicker } from "@mui/x-date-pickers";

export default function DatePickers({ filterBy, value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  const handleChange = (date) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="border p-2 rounded bg-white">
        {filterBy === "daily" && (
          <DatePicker
            value={selectedDate}
            onChange={handleChange}
            format="yyyy-MM-dd"
          />
        )}

        {filterBy === "monthly" && (
          <MonthPicker value={selectedDate} onChange={handleChange} />
        )}

        {filterBy === "yearly" && (
          <YearPicker value={selectedDate} onChange={handleChange} />
        )}
      </div>
    </LocalizationProvider>
  );
}
