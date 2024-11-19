import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiMapPin, FiDollarSign } from "react-icons/fi";
import { BsCheckCircle, BsXCircle } from "react-icons/bs";

const HistoryPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null); // To store user ID

  useEffect(() => {
    // Retrieve the user ID from localStorage
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        setError("User not logged in");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Ensure userId is available before making the API call
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/reservation/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // If you're using JWT tokens for authentication
          },
        });
        setReservations(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Reservation History</h1>
      {reservations.length === 0 ? (
        <p>No reservation history found.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.reservation_id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  );
};

const ReservationCard = ({ reservation }) => {
  return (
    <div className="p-4 bg-white rounded shadow-md flex flex-col md:flex-row justify-between">
      <div>
        <h2 className="text-lg font-semibold">
          {reservation.lieu_depart} → {reservation.lieu_destination}
        </h2>
        <div className="text-gray-600">
          <FiCalendar className="inline-block mr-2" />
          Departure: {new Date(reservation.date_depart).toLocaleDateString()}
        </div>
        <div className="text-gray-600">
          <FiCalendar className="inline-block mr-2" />
          Arrival: {new Date(reservation.date_destination).toLocaleDateString()}
        </div>
        <div className="text-gray-600">
          <FiDollarSign className="inline-block mr-2" />
          Price: ${reservation.prix}
        </div>
        <div className="text-gray-600">
          <FiMapPin className="inline-block mr-2" />
          Type: {reservation.type}
        </div>
      </div>
      <div className="flex items-center mt-4 md:mt-0">
        {reservation.status === "confirmed" ? (
          <BsCheckCircle className="text-green-500 mr-2" />
        ) : (
          <BsXCircle className="text-red-500 mr-2" />
        )}
        <span>{reservation.status}</span>
      </div>
    </div>
  );
};

export default HistoryPage;
