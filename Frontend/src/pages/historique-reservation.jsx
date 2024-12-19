import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router"; // Import useRouter from next/router
import '../app/globals.css';

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const fetchReservationHistory = async () => {
      try {
        // Get user data from localStorage (assuming user data contains user id)
        const userData = localStorage.getItem("user");
        if (!userData) {
          setError("User not logged in.");
          return;
        }

        const parsedUserData = JSON.parse(userData);
        const userId = parsedUserData.id; // Assuming the user object contains an 'id' field

        const response = await axios.get(`http://localhost:3000/reservation/history/${userId}`);
        
        // Check if no reservations were returned and handle accordingly
        if (response.data.length === 0) {
          setError("You have no reservation history.");
        } else {
          setReservations(response.data);
        }
      } catch (err) {
        setError("Could not fetch reservation history.");
      }
    };

    fetchReservationHistory();
  }, []); // Runs once when the component mounts

  const handleBackToHome = () => {
    router.push("/"); // Navigate to the home page
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-3xl font-semibold text-primaryGreen mb-6 text-center">Your Reservation History</h1>
      
      {/* Back to Home Button */}
      <button
        onClick={handleBackToHome}
        className="px-4 py-2 bg-primaryGreen text-white rounded-lg mb-6 hover:bg-green-600 transition duration-300"
      >
        Back to Home
      </button>

      <div className="space-y-6">
        {reservations.length === 0 ? (
          <p className="text-center text-lg text-gray-600">You have no reservation history.</p>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation.reservation_id}
              className="p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-primaryGreen mb-2">Trip Location: {reservation.lieu_destination}</h2>
              <p className="text-gray-700">Reservation Date: {new Date(reservation.date_reservation).toLocaleDateString()}</p>
              <p className="text-gray-700">Status: <span className={`font-semibold ${reservation.status === "Confirmed" ? "text-green-500" : "text-red-500"}`}>{reservation.status}</span></p>
              <p className="text-gray-700">Departure: {reservation.lieu_depart} → {reservation.lieu_destination}</p>
              <p className="text-gray-700">Departure Date: {new Date(reservation.date_depart).toLocaleDateString()}</p>
              <p className="text-gray-700">Price: <span className="font-semibold">{reservation.prix}DT</span></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReservationHistory;
