"use client";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

export default function DateTimePicker({ onChange, value, name, minDate }) {
    return (
        <Flatpickr
            value={value}
            name={name}
            options={{
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                minDate: minDate || null, // 🔹 Batasi tanggal hanya jika diberikan
            }}
            className="p-2 border border-gray-300 rounded w-64 border rounded-md p-2 w-full bg-white"
            onChange={(selectedDates) => {
                if (onChange) onChange(selectedDates[0]); // Ambil tanggal pertama
            }}
        />
    );
}
