// Schedule selection form component

import React from 'react';
import { Schedule, FormErrors } from '../lib/types';

interface ScheduleFormProps {
  schedule: Schedule;
  onChange: (schedule: Schedule) => void;
  errors: FormErrors;
  className?: string;
}

export default function ScheduleForm({
  schedule,
  onChange,
  errors,
  className = ''
}: ScheduleFormProps) {
  const handleChange = (field: keyof Schedule, value: string) => {
    onChange({
      ...schedule,
      [field]: value
    });
  };

  // Generate time options (8:00 to 18:00)
  const timeOptions = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <fieldset className={className}>
      <legend className="text-lg font-semibold text-gray-900 mb-4">
        Vælg dato og tidspunkt
      </legend>
      
      <div className="space-y-4">
        {/* Date */}
        <div>
          <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">
            Dato *
          </label>
          <input
            type="date"
            id="schedule-date"
            value={schedule.date}
            onChange={(e) => handleChange('date', e.target.value)}
            min={today}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            aria-describedby={errors.date ? 'schedule-date-error' : undefined}
          />
          {errors.date && (
            <p id="schedule-date-error" className="mt-1 text-sm text-red-600">
              {errors.date}
            </p>
          )}
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-4">
          {/* Start time */}
          <div>
            <label htmlFor="schedule-start-time" className="block text-sm font-medium text-gray-700 mb-1">
              Start kl. *
            </label>
            <select
              id="schedule-start-time"
              value={schedule.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className={`
                w-full h-11 px-3 border rounded-lg text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.time ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              aria-describedby={errors.time ? 'schedule-time-error' : undefined}
            >
              <option value="">Vælg starttid</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* End time */}
          <div>
            <label htmlFor="schedule-end-time" className="block text-sm font-medium text-gray-700 mb-1">
              Slut kl. *
            </label>
            <select
              id="schedule-end-time"
              value={schedule.customEndTime || ''}
              onChange={(e) => handleChange('customEndTime', e.target.value)}
              className={`
                w-full h-11 px-3 border rounded-lg text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.customEndTime ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              aria-describedby={errors.customEndTime ? 'schedule-time-error' : undefined}
            >
              <option value="">Vælg sluttid</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time range error */}
        {(errors.time || errors.customEndTime) && (
          <p id="schedule-time-error" className="text-sm text-red-600">
            {errors.time || errors.customEndTime}
          </p>
        )}
      </div>
    </fieldset>
  );
}
