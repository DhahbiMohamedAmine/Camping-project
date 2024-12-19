'use client';
import { useState } from 'react';
import "../app/globals.css";

export default function SupportPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleMessageChange = (e) => setMessage(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Hardcoding the email address
    const email = "dhahbimohamedaminef175@gmail.com";

    const response = await fetch("http://localhost:3000/support", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, message }),
    });

    const result = await response.json();

    if (response.ok) {
      setResponseMessage("Your message has been sent successfully!");
    } else {
      setResponseMessage(result.error || "Failed to send message.");
    }
    setIsSubmitting(false);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Support Client</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={handleMessageChange}
            placeholder="Write your message..."
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows="6"
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
        {responseMessage && (
          <div className="mt-4 text-center text-green-600">{responseMessage}</div>
        )}
        {/* Back button */}
        <button
          onClick={handleGoBack}
          className="w-full mt-4 p-3 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
        >
          Back home
        </button>
      </div>
    </div>
  );
}
