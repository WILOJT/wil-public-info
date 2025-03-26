"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';


interface Booking{
  facilityID: number
  date: string
  start: string
  end: string
  facilityname: string
  title: string
  headcount: number
  isFacilityBooked: number
}

interface Facility{
  facilityID: number
  facilityname: string
  capacity: number
  is_conference: number
}

export interface Bookings{
    bookings: Array<Booking>
    facilities: Array<Facility>
}

// Define the context type
interface BookingsContextType {
  Bookings: Bookings | null;
  setBookings: React.Dispatch<React.SetStateAction<Bookings | null>>;
}


// Create the context
const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

// Create a provider component
export const BookingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [Bookings, setBookings] = useState<Bookings | null>(null);

  useEffect(()=>{
    const storedBookings = localStorage.getItem('Bookings');
    if(storedBookings){
      setBookings(JSON.parse(storedBookings))
    }
  },[])

  useEffect(() => {
    // Store Bookings in localStorage whenever it changes
    if (Bookings) {
      // const BookingsWithMembers = {...Bookings, members:Array.from(Bookings.members)}
      localStorage.setItem('Bookings', JSON.stringify(Bookings));
    } else {
      localStorage.removeItem('Bookings'); // Clear if undefined
    }
  }, [Bookings]);

  return (
    <BookingsContext.Provider value={{ Bookings, setBookings }}>
      {children}
    </BookingsContext.Provider>
  );
};

// Create a custom hook to use the BookingsContext
export const useBookingsContext = () => {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error('Bookings Context must be used within a BookingsProvider');
  }
  return context;
};