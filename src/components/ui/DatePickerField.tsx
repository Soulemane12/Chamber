import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Controller } from 'react-hook-form';
import "react-datepicker/dist/react-datepicker.css";
import { cn } from '@/lib/utils';

interface DatePickerFieldProps {
  name: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any; // Using any to avoid TypeScript errors with different form types
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  inline?: boolean;
  className?: string;
  filterDate?: (date: Date) => boolean;
  wrapperClassName?: string;
}

const DatePickerField = forwardRef<HTMLDivElement, DatePickerFieldProps>(
  ({ 
    name, 
    label, 
    control, 
    error, 
    minDate, 
    maxDate, 
    placeholder, 
    disabled, 
    inline = false, 
    className,
    wrapperClassName,
    filterDate 
  }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        
        <div className={cn("booking-calendar", wrapperClassName)}>
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                minDate={minDate}
                maxDate={maxDate}
                placeholderText={placeholder}
                disabled={disabled}
                inline={inline}
                filterDate={filterDate}
                className={cn(
                  "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                  {
                    "border-red-500 dark:border-red-400": error,
                  }
                )}
              />
            )}
          />
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

DatePickerField.displayName = "DatePickerField";

export { DatePickerField }; 