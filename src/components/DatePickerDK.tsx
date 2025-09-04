import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { da } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('da', da);

interface DatePickerDKProps {
  value: string;
  onChange: (date: string) => void;
  availableDates?: string[];
  unavailableDates?: string[];
}

export default function DatePickerDK({ value, onChange, availableDates = [], unavailableDates = [] }: DatePickerDKProps) {
  const selectedDate = value ? new Date(value) : null;

  return (
    <div className="w-full">
      <DatePicker
        selected={selectedDate}
        onChange={date => date && onChange(date.toISOString().split('T')[0])}
        locale="da"
        dateFormat="dd-MM-yyyy"
        placeholderText="Vælg dato (dd-mm-yyyy)"
        className="w-full h-12 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        minDate={new Date()}
        showPopperArrow={false}
      />
    </div>
  );
}
