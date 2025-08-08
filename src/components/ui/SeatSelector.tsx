"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface SeatInfo {
  id: number;
  selected: boolean;
  name: string;
  error?: boolean;
}

export interface SeatSelectorProps {
  onSeatChange: (seats: SeatInfo[]) => void;
  selectedSeats?: SeatInfo[];
  className?: string;
  validateNames?: boolean;
}

export function SeatSelector({ 
  onSeatChange, 
  selectedSeats, 
  className,
  validateNames = false 
}: SeatSelectorProps) {
  // Initialize seats or use provided selected seats
  const [seats, setSeats] = useState<SeatInfo[]>([
    { id: 1, selected: false, name: '', error: false },
    { id: 2, selected: false, name: '', error: false },
    { id: 3, selected: false, name: '', error: false },
    { id: 4, selected: false, name: '', error: false },
  ]);

  const [validationTriggered, setValidationTriggered] = useState(false);

  // Sync with external state if provided
  useEffect(() => {
    if (selectedSeats) {
      setSeats(selectedSeats.map(seat => ({
        ...seat,
        error: validateNames && validationTriggered ? seat.selected && !seat.name : false
      })));
    }
  }, [selectedSeats, validateNames, validationTriggered]);

  const toggleSeat = (id: number) => {
    const newSeats = seats.map(seat => 
      seat.id === id 
        ? { 
            ...seat, 
            selected: !seat.selected,
            // Reset error when deselecting a seat
            error: !seat.selected ? false : (validateNames && validationTriggered ? !seat.name : false)
          } 
        : seat
    );
    setSeats(newSeats);
    onSeatChange(newSeats);
  };

  const updateSeatName = (id: number, name: string) => {
    const newSeats = seats.map(seat => 
      seat.id === id 
        ? { 
            ...seat, 
            name, 
            // Clear error when name is provided
            error: validateNames && validationTriggered ? !name.trim() : false 
          } 
        : seat
    );
    setSeats(newSeats);
    onSeatChange(newSeats);
  };

  const selectAllSeats = () => {
    const allSelected = seats.every(seat => seat.selected);
    const newSeats = seats.map(seat => ({ 
      ...seat, 
      selected: !allSelected,
      // Reset errors when deselecting all seats
      error: !allSelected && validateNames && validationTriggered ? !seat.name : false
    }));
    setSeats(newSeats);
    onSeatChange(newSeats);
  };

  // Function to validate all selected seats have names
  const validateSeatNames = () => {
    setValidationTriggered(true);
    const selectedSeatsWithoutNames = seats.filter(seat => seat.selected && !seat.name.trim());
    
    if (selectedSeatsWithoutNames.length > 0) {
      const updatedSeats = seats.map(seat => ({
        ...seat,
        error: seat.selected && !seat.name.trim()
      }));
      setSeats(updatedSeats);
      onSeatChange(updatedSeats);
      return false;
    }
    
    return true;
  };

  // Allow parent components to validate seat names
  useEffect(() => {
    if (validateNames) {
      validateSeatNames();
    }
  }, [validateNames]);

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select Your Seats</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose your preferred seats in the hyperbaric chamber.
          <span className="ml-1 text-rose-500 dark:text-rose-400 font-medium">Names are required for all selected seats.</span>
        </p>
        
        <Button 
          type="button" 
          onClick={selectAllSeats}
          variant={seats.every(seat => seat.selected) ? "outline" : "default"}
          className={`mb-4 shadow-sm ${seats.every(seat => seat.selected) ? "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-300 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-800 dark:border-rose-700" : ""}`}
        >
          {seats.every(seat => seat.selected) ? 'Deselect All Seats' : 'Select All Seats'}
        </Button>
      </div>

      {/* Chamber visualization */}
      <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden max-w-3xl mx-auto">
        {/* Chamber header with title */}
        <div className="bg-blue-600 dark:bg-blue-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-white text-center text-lg">
            Hyperbaric Chamber
          </h4>
        </div>
        
        {/* Chamber body */}
        <div className="p-8 relative">
          {/* Windows at the top */}
          <div className="flex justify-around mb-10 px-4">
            <div className="h-4 w-24 bg-blue-200 dark:bg-blue-700 rounded-full shadow-inner"></div>
            <div className="h-4 w-24 bg-blue-200 dark:bg-blue-700 rounded-full shadow-inner"></div>
            <div className="h-4 w-24 bg-blue-200 dark:bg-blue-700 rounded-full shadow-inner"></div>
          </div>
          
          {/* Seats container with perspective effect */}
          <div className="relative bg-gray-200/50 dark:bg-gray-800/30 rounded-xl p-6 transform-gpu perspective-800">
            {/* Vertical divider between seats 2 and 3 */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-gray-300 dark:bg-gray-600 z-0" />
            {/* Seats grid layout with 3D-like effect - display seats in a single row 1 2 3 4 */}
            <div className="relative z-10 grid grid-cols-4 gap-6 mb-4 transform-gpu rotateX-5">
              {seats.map((seat) => {
                const isSelected = seat.selected;
                const hasError = seat.error;
                
                return (
                <div key={seat.id} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => toggleSeat(seat.id)}
                    className={cn(
                      "relative group w-full aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-md",
                      isSelected 
                        ? hasError
                          ? "bg-gradient-to-br from-rose-200 to-rose-300 dark:from-rose-800/60 dark:to-rose-900/80 border-2 border-rose-500 dark:border-rose-600"
                          : "bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-800/60 dark:to-blue-900/80 border-2 border-blue-500 dark:border-blue-600"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                    )}
                  >
                    {/* Seat cushion effect */}
                    <div className={cn(
                      "absolute inset-2 rounded-lg opacity-60",
                      isSelected 
                        ? hasError
                          ? "bg-rose-100 dark:bg-rose-900"
                          : "bg-blue-100 dark:bg-blue-900"
                        : "bg-gray-50 dark:bg-gray-900"
                    )}></div>
                    
                    {/* Seat content */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className={cn(
                        "text-4xl font-bold mb-1",
                        isSelected
                          ? hasError
                            ? "text-rose-700 dark:text-rose-300"
                            : "text-blue-700 dark:text-blue-300"
                          : "text-gray-600 dark:text-gray-300"
                      )}>
                        {seat.id}
                      </div>
                      <div className={cn(
                        "text-sm font-medium",
                        isSelected
                          ? hasError
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      )}>
                        Seat {seat.id}
                      </div>
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 dark:bg-green-400 border-2 border-white dark:border-gray-800 shadow-md flex items-center justify-center">
                          <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {/* Name input field - only shown for selected seats */}
                  {seat.selected && (
                    <div className="mt-4 w-full px-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={seat.name}
                          onChange={(e) => updateSeatName(seat.id, e.target.value)}
                          placeholder="Enter client name"
                          className={cn(
                            "w-full p-3 text-sm rounded-lg border shadow-sm transition-all bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:outline-none text-gray-900 dark:text-white",
                            seat.error
                              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-700"
                              : "border-blue-300 focus:border-blue-500 focus:ring-blue-500/30 dark:border-blue-700"
                          )}
                        />
                        {seat.error && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-rose-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {seat.error && (
                        <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                          Please enter client name
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>
          
          {/* Door indicator */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 h-24 w-4 rounded-l-lg shadow-md flex items-center justify-center">
            <span className="text-[10px] font-medium text-white rotate-90 whitespace-nowrap uppercase tracking-wider">Door</span>
          </div>
        </div>
        
        {/* Floor/bottom of chamber */}
        <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 shadow-inner"></div>
        
        {/* Selected seats summary */}
        <div className="p-5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Booking Summary
          </h4>
          
          {seats.some(seat => seat.selected) ? (
            <div className="space-y-3">
              <div className="flex items-center mb-3">
                <div className="h-5 w-5 rounded-full bg-green-500 dark:bg-green-400 flex items-center justify-center mr-2">
                  <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {seats.filter(seat => seat.selected).length} {seats.filter(seat => seat.selected).length === 1 ? 'seat' : 'seats'} selected
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {seats
                  .filter(seat => seat.selected)
                  .map(seat => (
                    <div 
                      key={seat.id} 
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg shadow-sm",
                        seat.error
                          ? "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
                          : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      )}
                    >
                      <div 
                        className={cn(
                          "flex-shrink-0 mr-3 h-8 w-8 rounded-full flex items-center justify-center font-bold",
                          seat.error
                            ? "bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200"
                            : "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                        )}
                      >
                        {seat.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        {seat.name ? (
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {seat.name}
                          </p>
                        ) : (
                          <span className="italic text-sm text-rose-600 dark:text-rose-400">
                            Name required
                          </span>
                        )}
                      </div>
                      <button 
                        type="button"
                        className={cn(
                          "flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700",
                          seat.error
                            ? "text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200"
                            : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        )}
                        onClick={() => toggleSeat(seat.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No seats selected yet.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Click on a seat above to make your selection
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error message if validation fails */}
      {seats.some(seat => seat.error) && (
        <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg shadow-sm">
          <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Please provide names for all selected seats to continue
          </p>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gray-100 border-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 mr-2 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-blue-100 border-2 border-blue-500 dark:bg-blue-900/50 dark:border-blue-600 mr-2 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-rose-100 border-2 border-rose-500 dark:bg-rose-900/50 dark:border-rose-600 mr-2 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Missing name</span>
        </div>
      </div>
    </div>
  );
} 