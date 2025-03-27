"use client"
import React, { useEffect, useRef, useState } from "react";
import { useBookingsContext } from "../Context/bookingsContext";
import { CircularProgress, Typography } from "@mui/material";
import {toast} from "react-toastify"


interface Event{
  title:string,
  start:Date,
  end:Date,
  facilityID:number,
  isFacilityBooked:number,
  headCount:number,
  date:string
}

interface Row{
  timeslot: string
  data:Array<string>
}

const FullCalendarComponent = () => {
  
  const { Bookings, setBookings } = useBookingsContext();
  const [events, setEvents] = useState<Array<Event>>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const ws = new WebSocket('wss://wsserver-production-afea.up.railway.app');

    ws.onopen = () =>

        ws.onmessage = async (event) => {
            if (event.data instanceof Blob) {
                // Convert Blob to text
                event.data.text().then((text) => {
                    // console.log("📩 WebSocket received (text):", text);
                    try {
                        setBookings(JSON.parse(text)); // Parse JSON
                    } catch (error) {
                        console.error("❌ Error parsing WebSocket message:", error);
                    }
                });
            } else {
                // console.log("📩 WebSocket received (non-blob):", event.data);
                try {
                    setBookings(JSON.parse(event.data));
                } catch (error) {
                    console.error("❌ Error parsing WebSocket message:", error);
                }
            }
        };

        ws.onclose = () => console.log("❌ WebSocket disconnected");

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (Bookings) {
      const foo: Array<Event> = Bookings?.bookings?.map((booking) => ({
        end: new Date(`${booking.date}T${booking.end}`),
        start: new Date(`${booking.date}T${booking.start}`),
        title: booking.title,
        facilityID:booking.facilityID,
        isFacilityBooked:booking.isFacilityBooked,
        headCount:booking.headcount,
        date:booking.date
      }));
      
      setEvents(foo); // Runs only after mapping completes
    }
  }, [Bookings]);

  const [eventMatrix, setEventMatrix] = useState<Array<Row>>([]);
  const [dateSelected, setDateSelected] = useState<string>(new Date().toISOString().split("T")[0]);
  useEffect(() => {
      if (events?.length > 0 && Bookings?.facilities) {
        const today = new Date().toISOString().split("T")[0];

        // If the selected date is before today, set all cells to "N/A"
        if (dateSelected < today) {
          const matrix: Array<Row> = Array.from({ length: 32 }, (_, i) => {
            const hours = Math.floor(i / 2) + 6;
            const minutes = i % 2 === 0 ? "00" : "30";
            const timeslot = `${hours.toString().padStart(2, "0")}:${minutes} - ${(
              hours + (minutes === "30" ? 0 : 1)
            )
              .toString()
              .padStart(2, "0")}:${minutes === "30" ? "00" : "30"}`;

            return {
              timeslot,
              data: Array(Bookings.facilities.length).fill("N/A"),
            };
          });

          setEventMatrix(matrix);
          return;
        }
        // Generate time slots from 6:00 AM to 10:00 PM (30-minute intervals)
        const dateTimeArray = Array.from({ length: 33 }, (_, i) => {
          const hours = Math.floor(i / 2) + 6;
          const minutes = i % 2 === 0 ? "00" : "30";
          return `${dateSelected}T${hours.toString().padStart(2, "0")}:${minutes}:00`;
        });
    
        // Initialize the matrix
        const matrix:Array<Row> = dateTimeArray?.slice(0, -1).map((timeSlot, index) => {
          if (!dateTimeArray[index + 1]) return null; // Prevent out-of-bounds error
    
          const row = {
            timeslot: `${
              new Date(timeSlot).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
            } - ${
              new Date(dateTimeArray[index + 1]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
            }`,
            data: Array.from({ length: Bookings.facilities.length }),
          };
    
          const entireAreaBooking = events.find(event => 
            event.facilityID === Bookings.facilities.find(f => f.facilityname === "Entire Area")?.facilityID &&
            event.start <= new Date(timeSlot) &&
            event.end > new Date(timeSlot) &&
            new Date(event.start).toISOString().split("T")[0] === dateSelected
          );
          
          Bookings.facilities.forEach((facility, fIndex) => {
            const facilityBookings = events.filter((event) => {
              const eventDate = new Date(event.start).toISOString().split("T")[0]; // Extract YYYY-MM-DD
              return (
                event.facilityID === facility.facilityID &&
                event.start <= new Date(timeSlot) &&
                event.end > new Date(timeSlot) &&
                eventDate === dateSelected // Ensure only selected date
              );
            });
          
            // Check if any facility is marked as booked
            const isFacilityBooked = facilityBookings.some(b => b.isFacilityBooked === 1);
          
            // Check if there are any bookings that are NOT for "Entire Area"
            const nonEntireAreaBookingExists = events.some(event =>
              event.facilityID !== entireAreaBooking?.facilityID &&
              event.start <= new Date(timeSlot) &&
              event.end > new Date(timeSlot) &&
              new Date(event.start).toISOString().split("T")[0] === dateSelected
            );
          
            // Handling logic for "Entire Area"
            if (facility.facilityname === "Entire Area") {
              if (entireAreaBooking) {
                row.data[fIndex] = "Fully Booked"; // Entire Area is actually booked
              } else {
                row.data[fIndex] = nonEntireAreaBookingExists ? "--" : "No Booking"; // Set "--" if other facilities have bookings
              }
            } 
            // If "Entire Area" is booked, all other facilities must be "Facility Booked"
            else if (entireAreaBooking || isFacilityBooked) {
              row.data[fIndex] = "Fully Booked";
            } 
            // Normal facility booking logic
            else {
              const totalHeadcount = facilityBookings.reduce((sum, b) => sum + b.headCount, 0);
              row.data[fIndex] =
                totalHeadcount >= facility.capacity
                  ? "Slot full"
                  : facility.facilityname !== "Entire Area" && facility.is_conference === 0
                  ? `${totalHeadcount} out of ${facility.capacity}`
                  : "No Booking";
            }
          });
          
    
          return row;
        }).filter((row): row is Row => row !== null); // Filter out null values safely
    
        // console.log(matrix);
        setEventMatrix(matrix);
      }
  }, [events, Bookings, dateSelected, setBookings]);

  const toastShown = useRef(false);

  useEffect(() => {
    if (document.visibilityState === "visible" && eventMatrix.length > 0 && !toastShown.current) {
      toast.success("Bookings data updated.", { autoClose: 1500 });
      toastShown.current = true; // Mark toast as shown
    }
    setLastUpdated(new Date())
  
    // Reset toast flag after 1.5 seconds to allow future updates
    const resetToast = setTimeout(() => {
      toastShown.current = false;
    }, 1500);
  
    return () => clearTimeout(resetToast);
  }, [eventMatrix, dateSelected]);
  

  return (
    
      <>
        {eventMatrix?.length>0?
          <div className="w-full flex-grow flex flex-col gap-3">
            <div className="w-full flex justify-between items-end">
              <Typography variant="caption" color="gray">
                {`Last updated on ${lastUpdated.toDateString()} at ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`}
              </Typography>
              <input min={new Date().toISOString().split("T")[0]} onChange={(e)=>{setDateSelected(e.target.value)}} defaultValue={dateSelected} type="date" name="date" id="date" className="self-end p-3 shadow-md border-2 border-amber-400 bg-white rounded-md mt-3"/>
            </div>
            <table className="border-separate gap-3 w-full h-screen px-12 rounded-md py-3 overflow-auto bg-black border-2">
              <thead className="text-white">
                <tr>
                    <th className="bg-amber-400 text-xs md:text-sm lg:text-lg xl:text-lg p-3 text-black">Time Slot</th>
                    {Bookings?.facilities?.map((facility, index)=>(
                      <th className="bg-amber-400 text-xs md:text-sm lg:text-lg xl:text-lg p-3 text-black" key={index}>{facility.facilityname}</th>
                    ))}
                </tr>
              </thead>
              <tbody className="text-center font-bold">
                
                  {eventMatrix?.map((event,index)=>(
                    <tr key={index}>
                      <td className='py-3 text-xs md:text-sm lg:text-lg xl:text-lg bg-white'>{event.timeslot}</td>
                      {event?.data?.map((data,index)=>(
                        <td key={index} className={`py-3 text-xs md:text-sm lg:text-lg xl:text-lg bg-white ${data == "Fully Booked" || data == "--"?'text-red-500':data.includes('0') || data == 'No Booking'?'text-green-800':'text-orange-400 text-xl'}`}>{data}</td>
                      ))}
                      
                    </tr>
                  ))}
                
                
              </tbody>
            </table>
            </div>
          :
          <div className="flex flex-col gap-3 items-center justify-center">
            <CircularProgress/>
            <Typography>Loading</Typography>
          </div>
        }
      </>
    
  );
};

export default FullCalendarComponent;
