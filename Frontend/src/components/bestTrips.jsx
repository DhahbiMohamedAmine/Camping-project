import { useState, useEffect } from 'react';
import SingleTripHomePage from './SingleTripHomePage';

export default function Trip({ filteredTrips }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  // Function to fetch all trips
  const fetchTrips = async () => {
    try {
      const response = await fetch('http://localhost:3000/trip/get');
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      } else {
        console.error('Failed to fetch trips:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch trips initially
  useEffect(() => {
    fetchTrips();
  }, []); // Fetch trips on initial mount

  // Effect to fetch trips based on the search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const fetchSearchResults = async () => {
        setLoading(true); // Set loading state while fetching
        try {
          const response = await fetch(`http://localhost:3000/trip/search?query=${searchQuery}`);
          if (response.ok) {
            const data = await response.json();
            setTrips(data); // Update trips with search results
          } else {
            console.error('Failed to fetch search results:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error fetching search results:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSearchResults();
    } else {
      // If searchQuery is empty, fetch all trips again
      setLoading(true);
      fetchTrips(); // Call the fetchTrips function here
    }
  }, [searchQuery]); // Dependency on searchQuery to trigger search on change

  // Combine filteredTrips with search results
  const finalTrips = filteredTrips.length > 0 ? filteredTrips : trips;

  // Filter trips based on the search query
  const filteredTripList = finalTrips.filter((trip) => {
    const title = trip.title || ''; // Fallback to empty string if title is undefined
    const lieuDestination = trip.lieu_destination || ''; // Fallback to empty string if lieu_destination is undefined

    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lieuDestination.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="relative flex py-4 flex-col items-center justify-around text-center w-full p-4 bg-gray-50">
      <h1 className="font-bold text-4xl text-primaryGreen mb-6">Explore Popular Trips</h1>

      {/* Search Bar */}
      <div className="w-96 h-auto bg-white rounded-lg shadow-lg p-4 mb-6">
        <input
          type="text"
          placeholder="Search trips..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Trigger search query change
          className="w-full border border-gray-300 rounded-lg py-2 px-4 mb-4"
        />
      </div>

      {loading ? (
        <p>Loading trips...</p>
      ) : (
        <SingleTripHomePage trips={filteredTripList} />
      )}
    </div>
  );
}
