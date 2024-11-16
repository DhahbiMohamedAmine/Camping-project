"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import '../app/globals.css';
export default function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/reset-password-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred.");
      } else {
        setMessage(data.message || "Password reset request sent successfully.");
      }
    } catch (err) {
      setError("Server error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {message && <div className="text-green-500 mb-4">{message}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
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
          
          <button
            type="submit"
            className="w-full bg-primaryGreen text-white py-2 rounded-lg mt-4"
            disabled={loading}
          >
            {loading ? "Sending request..." : "Send Reset Request"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>
            Remembered your password?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
