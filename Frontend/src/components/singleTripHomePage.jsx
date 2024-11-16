import { useRouter } from 'next/navigation';

export default function SingleTripHomePage({ trips }) {
  const router = useRouter(); // Initialize the router

  // Handle "View Details" button click
  const handleViewDetails = (tripId) => {
    console.log('Navigating to trip ID:', tripId); // Debug log to check
    router.push(`/trips/${tripId}`); // Use push method to navigate
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {trips.map((trip) => (
        <div key={trip.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:scale-105">
          <div
            className="h-56 bg-black bg-cover bg-center"
            style={{ backgroundImage: `url(${trip.photo || "https://via.placeholder.com/150"})` }}
          ></div>
          <div className="h-auto p-4">
            <h1 className="font-semibold text-2xl mb-4">{trip.title}</h1>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-7 text-primaryGreen"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <p className="text-lg font-normal mx-4">{trip.lieu_destination}</p>
              </div>

              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-7 text-primaryGreen"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3L2 12h3v7h4v-5h6v5h4v-7h3L12 3z"
                  />
                </svg>
                <p className="text-lg font-normal mx-4">{trip.type}</p>
              </div>

              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-7 text-primaryGreen"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <p className="text-lg font-normal mx-4">{new Date(trip.date_depart).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-2xl font-bold">{trip.prix} DT</div>
              <button
                onClick={() => handleViewDetails(trip.id)} // This triggers navigation
                className="px-6 py-2 rounded bg-primaryGreen text-white font-semibold hover:bg-primaryGreenDark"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
