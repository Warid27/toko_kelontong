"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DatePickers({ filterBy, value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  const handleChange = (date) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <div className="border p-2 rounded bg-white">
      {filterBy === "daily" && (
        <DatePicker
          selected={selectedDate}
          onChange={handleChange}
          dateFormat="yyyy-MM-dd"
          className="border p-2 rounded bg-white"
        />
      )}

      {filterBy === "monthly" && (
        <DatePicker
          selected={selectedDate}
          onChange={handleChange}
          dateFormat="yyyy-MM"
          showMonthYearPicker
          className="border p-2 rounded bg-white"
        />
      )}

      {filterBy === "yearly" && (
        <DatePicker
          selected={selectedDate}
          onChange={handleChange}
          dateFormat="yyyy"
          showYearPicker
          className="border p-2 rounded bg-white"
        />
      )}
    </div>
  );
}
