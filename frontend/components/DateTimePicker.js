import { useEffect, useState } from "react";
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
  filterBy,
}) {
  const [plugins, setPlugins] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("flatpickr/dist/plugins/weekSelect/weekSelect").then((module) => {
        if (filterBy === "weekly") setPlugins([new module.default()]);
      });
      import("flatpickr/dist/plugins/monthSelect").then((module) => {
        if (filterBy === "monthly") setPlugins([new module.default()]);
      });
    }
  }, [filterBy]);

  return (
    <Flatpickr
      value={value}
      onChange={(selectedDates) => {
        if (selectedDates.length > 0 && onChange) {
          onChange(selectedDates[0]);
        }
      }}
      options={{
        plugins,
        dateFormat:
          filterBy === "weekly"
            ? "Y-W"
            : filterBy === "monthly"
            ? "Y-m"
            : filterBy === "yearly"
            ? "Y"
            : "Y-m-d H:i",
        altInput: true,
        altFormat:
          filterBy === "weekly"
            ? "F, Y - Week W"
            : filterBy === "monthly"
            ? "F Y"
            : filterBy === "yearly"
            ? "Y"
            : "Y-m-d H:i",
        minDate: filterBy === "yearly" ? "2000" : minDate || null,
        maxDate: filterBy === "yearly" ? "2030" : undefined,
        disableMobile: true,
        enableTime: filterBy === undefined,
        time_24hr: filterBy === undefined,
        ...options,
      }}
      className={classname || "p-2 border border-gray-300 rounded-md w-full bg-white"}
    />
  );
}
