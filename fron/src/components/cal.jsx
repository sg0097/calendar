import React, { useState, useEffect } from "react";
import DayCell from "./daycell";
import "../styles/calendar.css";

const Calendar = () => {
  const startYear = 2024;
  const endYear = 2029;

  // Initialize with January of the start year
  const [currentDate, setCurrentDate] = useState(new Date(startYear, 0, 1));
  const [holidays, setHolidays] = useState([]); // Holidays for the current month
  const [yearHolidays, setYearHolidays] = useState([]); // Holidays for the selected year
  const [showYearHolidays, setShowYearHolidays] = useState(false);

  // Fetch holidays for the current month
  useEffect(() => {
    const fetchHolidays = async () => {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      try {
        const response = await fetch(
          `http://localhost:8089/api/holidays?year=${year}&month=${month}`
        );
        const data = await response.json();
        setHolidays(data || []);
      } catch (error) {
        console.error("Error fetching holidays:", error);
        setHolidays([]);
      }
    };
    fetchHolidays();
  }, [currentDate]);

  // Navigate to previous month
  const prevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    if (prev.getFullYear() >= startYear) setCurrentDate(prev);
  };

  // Navigate to next month
  const nextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    if (next.getFullYear() <= endYear) setCurrentDate(next);
  };

  // Handle year dropdown change
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    const newDate = new Date(currentDate);
    newDate.setFullYear(newYear);
    setCurrentDate(newDate);
    setShowYearHolidays(false);
  };

  // Fetch all holidays for the selected year
  const fetchYearHolidays = async () => {
    const year = currentDate.getFullYear();
    try {
      const response = await fetch(`http://localhost:8089/api/holidays?year=${year}`);
      const data = await response.json();

      // Ensure only holidays for the selected year are stored
      const filteredHolidays = data.filter(h => h.date.startsWith(`${year}-`));
      
      setYearHolidays(filteredHolidays || []);
      setShowYearHolidays(true);
    } catch (error) {
      console.error("Error fetching year holidays:", error);
      setYearHolidays([]);
    }
  };

  // Get the number of days in the current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  // Generate the day cells
  const dayCells = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
    const holidaysForDay = (holidays || []).filter((h) => h.date === dateStr);
    dayCells.push(
      <DayCell
        key={dateStr}
        date={dateStr}
        holidays={holidaysForDay}
        refreshHolidays={() => setCurrentDate(new Date(currentDate))}
      />
    );
  }

  // Generate year options for the dropdown (2024 - 2029)
  const yearOptions = [];
  for (let y = startYear; y <= endYear; y++) {
    yearOptions.push(
      <option key={y} value={y}>
        {y}
      </option>
    );
  }

  return (
    <div className="calendar-container">
      {/* Header: Navigation and Year Dropdown */}
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button">Prev</button>
        <div className="year-selector">
          <select value={currentDate.getFullYear()} onChange={handleYearChange} className="dropdown">
            {yearOptions}
          </select>
          <span className="month-display">
            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
          </span>
        </div>
        <button onClick={nextMonth} className="nav-button">Next</button>
      </div>

      {/* Fetch Holidays Button */}
      <div className="fetch-container">
        <button onClick={fetchYearHolidays} className="fetch-button">
          Fetch Holidays for {currentDate.getFullYear()}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">{dayCells}</div>

      {/* Display Yearly Holiday List */}
      {showYearHolidays && (
        <div className="holiday-list">
          <h3 className="holiday-title">Holidays in {currentDate.getFullYear()}</h3>
          {yearHolidays.length === 0 ? (
            <p className="no-holidays">No holidays found for this year.</p>
          ) : (
            <ul>
              {yearHolidays.map((h) => (
                <li key={h.id} className="holiday-item">
                  <strong>{h.date}:</strong> {h.name} - {h.description}
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => setShowYearHolidays(false)} className="close-button">
            Hide List
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
