"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa"; // Import the user icon from react-icons

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check if the user is logged in when the component mounts
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setIsLoggedIn(true);
        setUser(parsedUserData);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setIsLoggedIn(false); // If JSON parsing fails, treat as logged out
      }
    }
  }, []); // Empty dependency array means this runs only once on mount

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    router.push("/login"); // Redirect to login page
  };

  return (
    <div className="flex pt-4 flex-col items-center w-full">
      {/* Logo Section */}
      <div className="h-20">
        <Image src="/campers.png" alt="Campers Logo" height={80} width={160} />
      </div>

      {/* Navbar Section */}
      <div className="bg-primaryGreen w-full p-2 flex items-center justify-between">
        {/* Menu Button */}
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
          <div className="text-white px-2">Menu</div>
        </div>

        {/* Conditional Buttons */}
        <div className="flex space-x-4 mr-4">
          {isLoggedIn ? (
            <>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-white text-primaryGreen font-semibold hover:bg-gray-100 transition duration-300"
              >
                Logout
              </button>
              <button
                onClick={() => router.push("/profile")} // Redirect to user profile page
                className="p-2 rounded-lg bg-white text-primaryGreen hover:bg-gray-100 transition duration-300"
              >
                <FaUserCircle size={24} /> {/* Display user icon */}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 rounded-lg bg-white text-primaryGreen font-semibold hover:bg-gray-100 transition duration-300"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-4 py-2 rounded-lg bg-gray-100 text-primaryGreen font-semibold hover:bg-white transition duration-300"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
