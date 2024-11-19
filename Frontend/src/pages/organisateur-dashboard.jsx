"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit, FiTrash, FiPlus, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/router";  // For redirecting after logout
import '../app/globals.css';

const OrganisateurDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null); // For editing
  const [formData, setFormData] = useState({
    type: "",
    lieu_depart: "",
    lieu_destination: "",
    date_depart: "",
    date_destination: "",
    prix: "",
    nb_place: "",
    description: "",
    photo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false); // Toggle form visibility

  const router = useRouter(); // Hook for redirecting

  // Fetch all trips
  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/trip/get");
      setTrips(response.data);
    } catch (err) {
      setError("Error fetching trips");
    } finally {
      setLoading(false);
    }
  };

  // Create a new trip
  const createTrip = async () => {
    try {
      setLoading(true);
      await axios.post("http://localhost:3000/trip/create", formData);
      fetchTrips();
      setFormData({});
      setShowForm(false);
    } catch (err) {
      setError("Error creating trip");
    } finally {
      setLoading(false);
    }
  };

  // Update an existing trip
  const updateTrip = async () => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:3000/trip/update/${selectedTrip.id}`, formData);
      fetchTrips();
      setSelectedTrip(null);
      setFormData({});
      setShowForm(false);
    } catch (err) {
      setError("Error updating trip");
    } finally {
      setLoading(false);
    }
  };

  // Delete a trip
  const deleteTrip = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/trip/delete/${id}`);
      fetchTrips();
    } catch (err) {
      setError("Error deleting trip");
    } finally {
      setLoading(false);
    }
  };

  // Logout functionality
  const handleLogout = () => {
    // Clear user session data
    localStorage.removeItem("userToken"); // Replace with your token key
    sessionStorage.removeItem("userToken"); // Optional: also remove from sessionStorage

    // Redirect to the login page
    router.push("/login"); // Change the route to your login page
  };

  // Handle form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Organisateur Dashboard</h1>

        {/* Display error message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2 hover:bg-red-700 transition-colors"
        >
          <FiLogOut />
          Logout
        </button>

        {/* Add New Trip Button */}
        <button
          onClick={() => {
            setFormData({});
            setSelectedTrip(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2 hover:from-indigo-600 hover:to-blue-500 transition-colors"
        >
          <FiPlus />
          Add New Trip
        </button>

        {/* Trip List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg shadow-xl p-4 flex flex-col justify-between transform transition-transform hover:scale-105"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-700">{trip.type}</h2>
                <p className="text-sm text-gray-500">
                  {trip.lieu_depart} → {trip.lieu_destination}
                </p>
                <p className="text-gray-600 mt-2">Price: <span className="font-bold">{trip.prix} DT</span></p>
                <p className="text-gray-600">Places remaining: <span className="font-bold">{trip.nb_place}</span></p>
                <p className="text-gray-500 mt-2 text-sm">{trip.description}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    setSelectedTrip(trip);
                    setFormData(trip);
                    setShowForm(true);
                  }}
                  className="text-blue-500 flex items-center gap-2 hover:text-blue-700"
                >
                  <FiEdit />
                  Edit
                </button>
                <button
                  onClick={() => deleteTrip(trip.id)}
                  className="text-red-500 flex items-center gap-2 hover:text-red-700"
                >
                  <FiTrash />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form for Creating/Editing Trip */}
        {showForm && (
          <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedTrip ? "Edit Trip" : "Create New Trip"}
            </h2>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                selectedTrip ? updateTrip() : createTrip();
              }}
            >
              {[
                { name: "type", label: "Type of Trip" },
                { name: "lieu_depart", label: "Lieu de Départ" },
                { name: "lieu_destination", label: "Lieu de Destination" },
                { name: "date_depart", label: "Date de Départ", type: "date" },
                { name: "date_destination", label: "Date de Destination", type: "date" },
                { name: "prix", label: "Price (DT)" },
                { name: "nb_place", label: "Number of Places" },
                { name: "description", label: "Description", type: "textarea" },
                { name: "photo", label: "Photo URL" },
              ].map(({ name, label, type = "text" }) => (
                <div key={name} className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  {type === "textarea" ? (
                    <textarea
                      name={name}
                      className="border-2 border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500"
                      value={formData[name] || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <input
                      type={type}
                      name={name}
                      className="border-2 border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500"
                      value={formData[name] || ""}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="col-span-1 md:col-span-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-green-500 transition-colors"
              >
                {selectedTrip ? "Update Trip" : "Create Trip"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="col-span-1 md:col-span-2 text-red-500 mt-2 hover:underline"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganisateurDashboard;
