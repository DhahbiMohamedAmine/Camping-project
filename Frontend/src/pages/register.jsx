"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // to navigate after successful registration
import '../app/globals.css'; // Adjust path if needed

export default function Register() {
  const [type, setType] = useState("voyageur");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [cin, setCin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);  // For error messages
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form Validation
    if (!type || !nom || !prenom || !email || !telephone || !cin || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);  // Clear previous errors

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, nom, prenom, email, telephone, cin, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "An error occurred.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.message) {
        // Redirect or show success message
        router.push("/login");  // Redirect to login page after successful registration
      }
    } catch (error) {
      setError("Server error: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          

          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              placeholder="Enter your last name"
              required
            />
          </div>

          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
            <input
              type="text"
              id="prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              placeholder="Enter your first name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Telephone</label>
            <input
              type="tel"
              id="telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <label htmlFor="cin" className="block text-sm font-medium text-gray-700">CIN</label>
            <input
              type="text"
              id="cin"
              value={cin}
              onChange={(e) => setCin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              placeholder="Enter your CIN"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primaryGreen text-white py-2 rounded-lg mt-4"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
