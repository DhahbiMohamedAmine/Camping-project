"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import '../../app/globals.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
  });
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
        setFormData({
          nom: parsedUserData.nom,
          prenom: parsedUserData.prenom,
          telephone: parsedUserData.telephone,
        }); // Set initial form data for editable fields only
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      router.push("/login"); // Redirect to login if no user data
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert("User data is missing.");
      return;
    }
    try {
      // Update the backend API URL based on your backend's actual URL (e.g., localhost:3000)
      const response = await fetch(`http://localhost:3000/user/update/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        router.push("/"); // Redirect to home or another page
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle Back Button click
  const handleBack = () => {
    router.push("/"); // Navigate to home or navbar
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nom" className="block">Nom</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="prenom" className="block">Prenom</label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="telephone" className="block">Telephone</label>
          <input
            type="text"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-primaryGreen text-white rounded-md"
        >
          Save Changes
        </button>
      </form>

      {/* Back to Navbar Button */}
      <button
        onClick={handleBack}
        className="w-full mt-4 p-2 bg-gray-500 text-white rounded-md"
      >
        Back to Home page
      </button>
    </div>
  );
}
