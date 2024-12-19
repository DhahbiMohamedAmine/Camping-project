'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import "../app/globals.css";
export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Processing your registration...');

  useEffect(() => {
    const tripId = searchParams.get('tripId');
    const userId = searchParams.get('userId');

    const registerUserForTrip = async () => {
      try {
        const response = await fetch("http://localhost:3000/reservation/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            trip_id: tripId,
            date_reservation: new Date().toISOString(),
            status: "Confirmed",
          }),
        });

        if (response.ok) {
          setMessage('Payment successful! Registration complete.');
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || "Failed to complete registration.");
        }
      } catch (error) {
        console.error("Error completing registration:", error);
        setMessage("There was an error completing your registration.");
      }
    };

    if (tripId && userId) {
      registerUserForTrip();
    } else {
      setMessage("Missing registration information.");
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-6">{message}</h1>
        <a
          href="http://localhost:3001"
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-500 transition duration-300"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
