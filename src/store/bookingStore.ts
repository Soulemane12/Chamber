import { create } from 'zustand';

export type BookingState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: Date | null;
  time: string;
  duration: '60' | '90' | '120';
  notes: string;
  bookingId: string | null;
  bookingStatus: 'pending' | 'confirmed' | 'canceled' | null;
};

export type BookingActions = {
  setField: <K extends keyof BookingState>(field: K, value: BookingState[K]) => void;
  resetForm: () => void;
  confirmBooking: (bookingId: string) => void;
  cancelBooking: () => void;
};

// Initial state
const initialState: BookingState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  date: null,
  time: '',
  duration: '60',
  notes: '',
  bookingId: null,
  bookingStatus: null,
};

// Create the store
export const useBookingStore = create<BookingState & BookingActions>((set) => ({
  ...initialState,
  
  // Actions
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  
  resetForm: () => set(initialState),
  
  confirmBooking: (bookingId) => set({
    bookingId,
    bookingStatus: 'confirmed',
  }),
  
  cancelBooking: () => set({
    bookingStatus: 'canceled',
  }),
})); 