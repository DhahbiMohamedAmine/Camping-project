"use client";
import { useState } from "react";

export default function Hero({ setFilteredTrips }) {
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [dateArrivee, setDateArrivee] = useState("");
  const [type, setType] = useState("");
  const [lieuArrive, setLieuArrive] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false); 

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const fetchFilteredTrips = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/trip/filtrer?prix_min=${prixMin}&prix_max=${prixMax}&date_depart=${dateDepart}&date_arrivee=${dateArrivee}&type=${type}&lieu_arrive=${lieuArrive}`
      );
      if (response.ok) {
        const data = await response.json();
        setFilteredTrips(data); 
      } else {
        console.error("Failed to fetch filtered trips");
      }
    } catch (error) {
      console.error("Error fetching filtered trips:", error);
    }
  };

  const handleApplyFilter = () => {
    fetchFilteredTrips(); 
    toggleFilter(); 
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 flex py-4 flex-col items-center justify-around text-center w-full">
      <h1 className="text-white text-4xl font-bold my-4">Escape Your Comfort Zone.</h1>
      <h2 className="text-white text-xl mt-2 my-4">Grab your stuff and let's get lost.</h2>

      

      {isFilterOpen && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-xl font-bold mb-6 text-primaryGreen">Apply Filters</h3>

            <div className="space-y-4">
              {/* Price Range Section */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Price Range</label>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={prixMin}
                    onChange={(e) => setPrixMin(e.target.value)}
                    className="w-full border rounded py-2 px-4 mb-2"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={prixMax}
                    onChange={(e) => setPrixMax(e.target.value)}
                    className="w-full border rounded py-2 px-4 mb-2"
                  />
                </div>
              </div>

              {/* Date Range Section */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Date Range</label>
                <div className="flex space-x-4">
                  <input
                    type="date"
                    value={dateDepart}
                    onChange={(e) => setDateDepart(e.target.value)}
                    className="w-full border rounded py-2 px-4 mb-2"
                  />
                  <input
                    type="date"
                    value={dateArrivee}
                    onChange={(e) => setDateArrivee(e.target.value)}
                    className="w-full border rounded py-2 px-4 mb-2"
                  />
                </div>
              </div>

              {/* Type & Destination Section */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Type of Trip</label>
                <input
                  type="text"
                  placeholder="Type (e.g. Adventure, Relax)"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border rounded py-2 px-4 mb-4"
                />

                <label className="block text-gray-700 font-semibold mb-2">Destination</label>
                <input
                  type="text"
                  placeholder="Destination"
                  value={lieuArrive}
                  onChange={(e) => setLieuArrive(e.target.value)}
                  className="w-full border rounded py-2 px-4 mb-4"
                />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={handleApplyFilter}
                className="w-full bg-primaryGreen p-3 rounded text-white font-semibold mb-2 hover:bg-primaryGreenDark"
              >
                Apply Filters
              </button>
              <button
                onClick={toggleFilter}
                className="w-full bg-red-500 p-3 rounded text-white mb-2 hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={toggleFilter}
        className="fixed bottom-4 right-4 bg-primaryGreen p-4 rounded-full text-white shadow-lg hover:bg-primaryGreenDark z-20"
      >
        <span className="text-2xl">🔍</span>
      </button>
    </div>
  );
}
