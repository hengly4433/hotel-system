"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type DatePickerProps = {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  required?: boolean;
  minDate?: string;
  placeholder?: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function DatePicker({ value, onChange, required, minDate, placeholder = "dd/mm/yyyy" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse value or use today
  const today = new Date();
  const parsedValue = value ? new Date(value) : null;
  const [viewYear, setViewYear] = useState(parsedValue?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedValue?.getMonth() ?? today.getMonth());

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const handlePrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const handleNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleSelectDay = useCallback((day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(dateStr);
    setIsOpen(false);
  }, [viewYear, viewMonth, onChange]);

  const handleToday = useCallback(() => {
    const t = new Date();
    const dateStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    onChange(dateStr);
    setIsOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange("");
    setIsOpen(false);
  }, [onChange]);

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const days: (number | null)[] = [];
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  // Check if a day is today
  const isToday = (day: number) => {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  // Check if a day is selected
  const isSelected = (day: number) => {
    if (!parsedValue) return false;
    return day === parsedValue.getDate() && viewMonth === parsedValue.getMonth() && viewYear === parsedValue.getFullYear();
  };

  // Check if a day is disabled (before minDate)
  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const currentDate = new Date(viewYear, viewMonth, day);
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    return currentDate < min;
  };

  return (
    <div className="datepicker-container" ref={containerRef}>
      <button
        type="button"
        className={`datepicker-trigger ${value ? "has-value" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="datepicker-value">
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <svg className="datepicker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && (
        <div className="datepicker-dropdown" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="datepicker-header">
            <button type="button" className="datepicker-nav" onClick={handlePrevMonth} aria-label="Previous month">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
            <span className="datepicker-month-year">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" className="datepicker-nav" onClick={handleNextMonth} aria-label="Next month">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>

          {/* Weekdays */}
          <div className="datepicker-weekdays">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="datepicker-weekday">{wd}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="datepicker-days">
            {days.map((day, idx) => (
              <div key={idx} className="datepicker-day-cell">
                {day !== null && (
                  <button
                    type="button"
                    className={`datepicker-day ${isToday(day) ? "is-today" : ""} ${isSelected(day) ? "is-selected" : ""} ${isDisabled(day) ? "is-disabled" : ""}`}
                    onClick={() => !isDisabled(day) && handleSelectDay(day)}
                    disabled={isDisabled(day)}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="datepicker-footer">
            <button type="button" className="datepicker-action" onClick={handleClear}>
              Clear
            </button>
            <button type="button" className="datepicker-action datepicker-action-primary" onClick={handleToday}>
              Today
            </button>
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && <input type="hidden" value={value} required />}
    </div>
  );
}
