"use client";
import { useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

export default function DateTimePicker({
  itemCampaignDataAdd,//ridridwar
  handleChangeAdd,//ridridwar
}) {
  const [startDate, setStartDate] = useState(
    itemCampaignDataAdd.start_date
      ? new Date(itemCampaignDataAdd.start_date)
      : null
  );
  const [endDate, setEndDate] = useState(
    itemCampaignDataAdd.end_date ? new Date(itemCampaignDataAdd.end_date) : null
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div>
        {/* Start Date Picker */}
        <p className="font-semibold mt-4">Start Date</p>
        <DatePicker
          value={startDate}
          onChange={(date) => {
            setStartDate(date);
            handleChangeAdd(date, "start_date");

            // Ensure end date is not before start date
            if (endDate && date && endDate < date) {
              setEndDate(date);
              handleChangeAdd(date, "end_date");
            }
          }}
          format="yyyy-MM-dd"
          className="border p-2 rounded bg-white w-full"
        />

        {/* End Date Picker */}
        <p className="font-semibold mt-4">End Date</p>
        <DatePicker
          value={endDate}
          onChange={(date) => {
            setEndDate(date);
            handleChangeAdd(date, "end_date");
          }}
          format="yyyy-MM-dd"
          minDate={startDate} // Prevent selecting a date before Start Date
          className="border p-2 rounded bg-white w-full"
        />
      </div>
    </LocalizationProvider>
  );
}
