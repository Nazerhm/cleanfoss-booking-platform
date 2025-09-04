'use client';

import React, { useState } from 'react';
import { Schedule, TimeSlot } from '../lib/types';
import DatePickerDK from './DatePickerDK';

interface EnhancedScheduleFormProps {
  schedule: Schedule;
  onScheduleChange: (schedule: Schedule) => void;
}

const timeSlots: TimeSlot[] = [
  { id: 'morning', label: '08:00 - 12:00', startTime: '08:00', endTime: '12:00' },
  { id: 'midday', label: '12:00 - 15:00', startTime: '12:00', endTime: '15:00' },
  { id: 'afternoon', label: '15:00 - 19:00', startTime: '15:00', endTime: '19:00' },
];

export default function EnhancedScheduleForm({ schedule, onScheduleChange }: EnhancedScheduleFormProps) {
  const [useCustomTime, setUseCustomTime] = useState(!schedule.timeSlot && schedule.time !== '');

  const handleSlotSelect = (slot: TimeSlot) => {
    if (useCustomTime) return;
    
    onScheduleChange({
      ...schedule,
      time: slot.startTime,
      timeSlot: slot,
      useCustomTime: false,
    });
  };

  const handleCustomTimeChange = (time: string) => {
    onScheduleChange({
      ...schedule,
      time,
      timeSlot: undefined,
      useCustomTime: true,
    });
  };

  const handleDateChange = (date: string) => {
    onScheduleChange({
      ...schedule,
      date,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Vælg dato og tidspunkt
      </h3>

      {/* Date Selection */}
      <div className="w-full space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Ønsket dato
        </label>
        <DatePickerDK
          value={schedule.date}
          onChange={handleDateChange}
          availableDates={[]}
          unavailableDates={[]}
        />
      </div>

      {/* Time slot toggle */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setUseCustomTime(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors duration-200 ${
            !useCustomTime
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
          }`}
        >
          Standard tider
        </button>
        <button
          type="button"
          onClick={() => setUseCustomTime(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors duration-200 ${
            useCustomTime
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
          }`}
        >
          Vælg tid
        </button>
      </div>

      {/* Time Selection */}
      {!useCustomTime ? (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Ønsket tidsperiode
          </label>
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleSlotSelect(slot)}
                className={`w-full p-4 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                  schedule.timeSlot?.id === slot.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium">{slot.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {slot.startTime} - {slot.endTime}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Ønsket starttidspunkt
          </label>
          <input
            type="time"
            value={schedule.time || ''}
            onChange={(e) => handleCustomTimeChange(e.target.value)}
            className="w-full h-12 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>Vi er åbne mellem 08:00-19:00 på hverdage og 09:00-16:00 i weekender</p>
      </div>

      {/* Special notes */}
      <div className="w-full space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Særlige ønsker (valgfrit)
        </label>
        <textarea
          value={schedule.notes || ''}
          onChange={(e) => onScheduleChange({
            ...schedule,
            notes: e.target.value
          })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="F.eks. særlige instrukser, adgangskoder, parkeringsforhold..."
        />
      </div>
    </div>
  );
}
