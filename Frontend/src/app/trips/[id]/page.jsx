'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaPlane, FaCalendarAlt, FaMoneyBillWave, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const id = params?.id;

  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchAverageRating = useCallback(async () => {
    if (id) {
      try {
        const response = await fetch(`http://localhost:3000/trip/rating/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAverageRating(data.average_rating || 0);
        }
      } catch (error) {
        console.error("Error fetching average rating:", error);
      }
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchTripDetails = async () => {
        try {
          const response = await fetch(`http://localhost:3000/trip/get/${id}`);
          if (response.ok) {
            const data = await response.json();
            setTrip(data);
            fetchAverageRating(); // Fetch rating after trip details
          } else {
            console.error("Failed to fetch trip details");
          }
        } catch (error) {
          console.error("Error fetching trip details:", error);
        }
      };

      fetchTripDetails();
    }
  }, [id, fetchAverageRating]);

  useEffect(() => {
    if (user && trip) {
      const fetchUserRating = async () => {
        try {
          const response = await fetch(`http://localhost:3000/trip/ratings/${trip.id}/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserRating(data.rating || 0);
          }
        } catch (error) {
          console.error("Error fetching user rating:", error);
        }
      };

      fetchUserRating();
    }
  }, [user, trip]);

  const handleRating = async (ratingValue) => {
    if (!user) {
      alert("You must be logged in to rate a trip.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/trip/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trip_id: trip.id,
          user_id: user.id,
          rating: ratingValue,
        }),
      });

      if (response.ok) {
        setUserRating(ratingValue);
        await fetchAverageRating(); // Fetch the updated average rating
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit rating.");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("There was an error submitting your rating.");
    }
  };

  const renderStars = (rating) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

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
      } else {
        alert(result.error || "Failed to register for the trip.");
      }
    } catch (error) {
      console.error("Error registering for trip:", error);
      alert("There was an error registering for the trip.");
    }
  };


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

  if (!trip || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading trip details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Background Image */}
      <div className="relative mx-auto max-w-4xl h-56 sm:h-64 md:h-72 lg:h-80 bg-cover bg-center rounded-lg overflow-hidden shadow-md">
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{
            backgroundImage: `url(${trip.photo || "https://via.placeholder.com/150"})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold text-center p-4">
            {trip.title}
          </h1>
        </div>
      </div>

      {/* Trip Details */}
      <div className="max-w-4xl mx-auto p-6 sm:p-10">
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
          <p className="text-xl text-gray-700 leading-relaxed">{trip.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-primaryGreen text-2xl" />
              <div>
                <strong className="block text-gray-800">Destination:</strong>
                <span className="text-gray-600">{trip.lieu_destination}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaPlane className="text-primaryGreen text-2xl" />
              <div>
                <strong className="block text-gray-800">Type:</strong>
                <span className="text-gray-600">{trip.type}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-primaryGreen text-2xl" />
              <div>
                <strong className="block text-gray-800">Departure Date:</strong>
                <span className="text-gray-600">{new Date(trip.date_depart).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaMoneyBillWave className="text-primaryGreen text-2xl" />
              <div>
                <strong className="block text-gray-800">Price:</strong>
                <span className="text-gray-600">{trip.prix} DT</span>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-lg font-semibold">Average Rating:</span>
              <div className="flex space-x-1">{renderStars(averageRating)}</div>
            </div>

            {user && (
              <div>
                <span className="text-lg font-semibold">Your Rating:</span>
                <div className="flex space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      disabled={userRating > 0}
                      className={`${
                        userRating >= rating ? "text-yellow-400" : "text-gray-400"
                      } hover:text-yellow-400`}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Register and Cancel Buttons */}
          <div className="text-center space-y-6">
            {/* Register Button */}
            {!isRegistered ? (
              <button
                onClick={handleRegister}
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-primaryGreen text-white font-semibold hover:bg-primaryGreenDark transition duration-300 ease-in-out transform hover:scale-105"
              >
                Register for this trip
              </button>
            ) : (
              <div className="w-full sm:w-auto space-y-2">
                <p className="text-lg text-gray-600 mb-2">You are already registered for this trip.</p>
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-3 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Cancel Reservation
                </button>
              </div>
            )}

            {/* Back to Trips Button */}
            <button
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-primaryGreen text-white font-semibold hover:bg-primaryGreenDark transition duration-300 ease-in-out transform hover:scale-105"
            >
              Back to Trips
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
