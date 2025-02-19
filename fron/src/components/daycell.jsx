import React, { useState } from "react";

const DayCell = ({ date, holidays, refreshHolidays }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDesc, setHolidayDesc] = useState("");

  const addHoliday = async () => {
    const payload = { date, name: holidayName, description: holidayDesc };
    try {
      const response = await fetch("http://localhost:8089/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setHolidayName("");
        setHolidayDesc("");
        refreshHolidays(); // ✅ Refresh after adding
      } else {
        console.error("Error adding holiday:", response.status);
      }
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };

  const deleteHoliday = async (holidayId) => {
    try {
      const response = await fetch(`http://localhost:8089/api/holidays/${holidayId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        refreshHolidays(); // ✅ Refresh after deleting
      } else {
        console.error("Error deleting holiday:", response.status);
      }
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  return (
    <div
      className="border p-2 relative hover:bg-gray-100"
      onMouseEnter={() => setShowAdd(true)}
      onMouseLeave={() => setShowAdd(false)}
    >
      <div className="text-sm font-medium">{date.split("-")[2]}</div>

      {/* Display holidays correctly */}
      {holidays.length > 0 ? (
        holidays.map((holiday) => (
          <div key={holiday.id} className="flex justify-between items-center text-xs text-red-600 mt-1">
            <span>{holiday.name}</span>
            <button onClick={() => deleteHoliday(holiday.id)} className="bg-red-500 text-white px-1 py-0.5 rounded text-xs">
              Delete
            </button>
          </div>
        ))
      ) : (
        <span className="text-gray-400 text-xs"></span>
      )}

      {/* Show add holiday form on hover */}
      {showAdd && (
        <div className="absolute top-0 left-0 right-0 bg-white border p-1 z-10">
          <input
            type="text"
            placeholder="Holiday Name"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            className="w-full mb-1 border p-1 text-xs"
          />
          <input
            type="text"
            placeholder="Description"
            value={holidayDesc}
            onChange={(e) => setHolidayDesc(e.target.value)}
            className="w-full mb-1 border p-1 text-xs"
          />
          <button onClick={addHoliday} className="bg-green-500 text-white px-2 py-1 text-xs rounded">
            Add
          </button>
        </div>
      )}
    </div>
  );
};

export default DayCell;
