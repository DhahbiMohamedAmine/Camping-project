"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  FaMapMarkerAlt,
  FaPlane,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";

const stripePromise = loadStripe("pk_test_51PG3uWClavGSdaZ6aZMjF4SQtCjlKDIWWKtqWFTwyS1yYSO0VI5Oc6wLVn5zk1z27NiqBuyBNDlpanv6dJlQyvjt007bkgZHqS");

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

  const checkRegistration = useCallback(async () => {
    if (user && id) {
      try {
        const response = await fetch(`http://localhost:3000/reservation/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            trip_id: id,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setIsRegistered(data.isRegistered);
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      }
    }
  }, [user, id]);

  useEffect(() => {
    if (id) {
      const fetchTripDetails = async () => {
        try {
          const response = await fetch(`http://localhost:3000/trip/get/${id}`);
          if (response.ok) {
            const data = await response.json();
            setTrip(data);
            fetchAverageRating();
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
    if (user && id) {
      checkRegistration();
    }
  }, [user, id, checkRegistration]);

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
        await fetchAverageRating();
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
      const response = await fetch("http://localhost:3000/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          userId: user.id,
          price: trip.prix,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to create checkout session.");
        return;
      }
  
      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      const result = await stripe.redirectToCheckout({ sessionId });
  
      if (result.error) {
        alert(result.error.message);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("There was an error processing your payment.");
    }
  };

  const handleCancel = async () => {
    if (!user || !trip) {
      alert("Unable to cancel registration at this time.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/reservation/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          trip_id: trip.id,
        }),
      });

      if (response.ok) {
        setIsRegistered(false);
        alert("Your registration has been cancelled.");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to cancel registration.");
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
      alert("There was an error cancelling your registration.");
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
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
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
                <span className="text-gray-600">
                  {new Date(trip.date_depart).toLocaleDateString()}
                </span>
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

          {/* Register/Cancel Button */}
          <div className="text-center space-y-6">
            {isRegistered ? (
              <button
                onClick={handleCancel}
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Annuler
              </button>
            ) : (
              <button
                onClick={handleRegister}
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-primaryGreen text-white font-semibold hover:bg-primaryGreenDark transition duration-300 ease-in-out transform hover:scale-105"
              >
                Register for this trip
              </button>
            )}

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

