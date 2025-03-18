"use client";
import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers";

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
            format="yyyy/MM/dd"
          />
        )}

        {filterBy === "monthly" && (
          <DatePicker
            value={selectedDate}
            onChange={handleChange}
            views={["year", "month"]}
          />
        )}

        {filterBy === "yearly" && (
          <DatePicker
            value={selectedDate}
            onChange={handleChange}
            views={["year"]}
          />
        )}
      </div>
    </LocalizationProvider>
  );
}
