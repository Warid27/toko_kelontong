"use client";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

export default function DateTimePicker({
  onChange,
  value,
  name,
  minDate,
  options,
  placeholder,
  classname,
}) {
  return (
    <Flatpickr
      value={value }
      name={name}
      placeholder={placeholder || ""}
      options={
        options || {
          enableTime: true,
          dateFormat: "Y-m-d H:i",
          time_24hr: true,
          minDate: minDate || null, // 🔹 Batasi tanggal hanya jika diberikan
        }
      }
      className={
        classname || "p-2 border border-gray-300  rounded-md w-full bg-white"
      }
      // onChange={(selectedDates) => {
      //     if (onChange) onChange(selectedDates[0]); // Ambil tanggal pertama
      // }}
      onChange={(selectedDates) => {
        if (selectedDates.length > 0 && onChange) {
          onChange(selectedDates[0]); // Pastikan ada elemen sebelum mengakses indeks 0
        }
      }}
    />
  );
}
