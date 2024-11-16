"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../app/globals.css";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!newPassword || !token) {
      setError("Please enter a new password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred.");
      } else {
        setMessage("Password reset successfully. You can now log in.");
        setTimeout(() => router.push("/login"), 3000); // Redirect to login after 3 seconds
      }
    } catch (err) {
      setError("Server error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>

        {/* Error Notification */}
        {error && (
          <p className="text-lg text-red-600 font-semibold mb-4">{error}</p>
        )}

        {/* Success Notification */}
        {message && (
          <p className="text-lg text-green-600 font-semibold mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              placeholder="Enter your new password"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-primaryGreen text-white py-2 rounded-lg mt-4 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
