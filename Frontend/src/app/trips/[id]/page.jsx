"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaPlane, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa"; // Import icons

export default function TripDetailsPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null); // To manage user state
  const [isRegistered, setIsRegistered] = useState(false); // To track if user is already registered

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch trip details
  useEffect(() => {
    if (id) {
      const fetchTripDetails = async () => {
        try {
          const response = await fetch(`http://localhost:3000/trip/get/${id}`);
          if (response.ok) {
            const data = await response.json();
            setTrip(data);
          } else {
            console.error("Failed to fetch trip details");
          }
        } catch (error) {
          console.error("Error fetching trip details:", error);
        }
      };
      fetchTripDetails();
    }
  }, [id]);

  // Check if user has already registered for the trip
  useEffect(() => {
    if (user && trip) {
      const checkRegistration = async () => {
        try {
          const response = await fetch(`http://localhost:3000/reservation/get`, {
            method: "GET",
          });
          const reservations = await response.json();
          const userReservation = reservations.find(
            (reservation) => reservation.user_id === user.id && reservation.trip_id === trip.id
          );
          setIsRegistered(!!userReservation);
        } catch (error) {
          console.error("Error checking registration:", error);
        }
      };

      checkRegistration();
    }
  }, [user, trip]);

  const handleRegister = async () => {
    if (!user) {
      alert("You must be logged in to register for a trip.");
      return;
    }

    try {
      const reservationData = {
        user_id: user.id,
        trip_id: trip.id,
        date_reservation: new Date().toISOString(),
        status: "Pending", // You can modify this as per your system
      };

      const response = await fetch("http://localhost:3000/reservation/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      const result = await response.json();
      if (response.ok) {
        setIsRegistered(true);
        alert("You have successfully registered for the trip!");
      } else {
        alert(result.error || "Failed to register for the trip.");
      }
    } catch (error) {
      console.error("Error registering for trip:", error);
      alert("There was an error registering for the trip.");
    }
  };

  const handleCancel = async () => {
    if (!user || !trip) return;

    try {
      // Fetch reservations for the current trip
      const response = await fetch(`http://localhost:3000/reservation/get`);
      const reservations = await response.json();

      // Find the reservation for the current user and trip
      const userReservation = reservations.find(
        (reservation) => reservation.user_id === user.id && reservation.trip_id === trip.id
      );

      if (userReservation) {
        // Delete the reservation based on its ID
        const deleteResponse = await fetch(
          `http://localhost:3000/reservation/delete/${userReservation.id}`,
          {
            method: "DELETE",
          }
        );

        if (deleteResponse.ok) {
          setIsRegistered(false);
          alert("Your reservation has been canceled.");
        } else {
          const errorData = await deleteResponse.json();
          alert(errorData.error || "Failed to cancel the reservation.");
        }
      } else {
        alert("No reservation found for this trip.");
      }
    } catch (error) {
      console.error("Error canceling reservation:", error);
      alert("There was an error canceling your reservation.");
    }
  };

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading trip details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="relative mx-auto max-w-4xl h-56 sm:h-64 md:h-72 lg:h-80 bg-cover bg-center rounded-lg overflow-hidden shadow-md">
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{
            backgroundImage: `url(${trip.photo || "https://via.placeholder.com/150"})`,
          }}
        >
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold text-center p-4">
            {trip.title}
          </h1>
        </div>
      </div>

      {/* Trip Details Section */}
      <div className="max-w-4xl mx-auto p-6 sm:p-10">
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
          <p className="text-xl text-gray-700 leading-relaxed">{trip.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destination */}
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-primaryGreen text-2xl" />
              <div>
                <strong className="block text-gray-800">Destination:</strong>
                <span className="text-gray-600">{trip.lieu_destination}</span>
              </div>
            </div>

            {/* Type of Trip */}
            <div className="flex items-center space-x-3">
              <FaPlane className="text-primaryGreen text-2xl" />
              <div>
                <strong className="block text-gray-800">Type:</strong>
                <span className="text-gray-600">{trip.type}</span>
              </div>
            </div>

            {/* Departure Date */}
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-primaryGreen text-2xl" />
              <div>
                <strong className="block text-gray-800">Departure Date:</strong>
                <span className="text-gray-600">
                  {new Date(trip.date_depart).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <FaMoneyBillWave className="text-primaryGreen text-2xl" />
              <div>
                <strong className="block text-gray-800">Price:</strong>
                <span className="text-gray-600">{trip.prix} DT</span>
              </div>
            </div>
          </div>

          {/* Register / Cancel Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!isRegistered ? (
              <button
                onClick={handleRegister}
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-primaryGreen text-white font-semibold hover:bg-primaryGreenDark transition duration-300 ease-in-out transform hover:scale-105"
              >
                Register for this trip
              </button>
            ) : (
              <div className="w-full sm:w-auto">
                <p className="text-lg text-green-600 font-semibold mb-2">You are already registered for this trip!</p>
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-3 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Cancel Reservation
                </button>
              </div>
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-primaryGreen text-white font-semibold hover:bg-primaryGreenDark transition duration-300 ease-in-out transform hover:scale-105 mt-4"
          >
            Back to Trips
          </button>
        </div>
      </div>
    </div>
  );
}
