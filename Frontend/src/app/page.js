"use client"; 

import { useState } from 'react';
import Trip from "@/components/bestTrips";  // Adjust the path if needed
import Hero from '@/components/hero';  // Adjust the path if needed

export default function Home() {
  const [filteredTrips, setFilteredTrips] = useState([]);  // Now `useState` will work

  return (
    <div>
      <Hero setFilteredTrips={setFilteredTrips} />
      <Trip filteredTrips={filteredTrips} /> {/* Pass filteredTrips here */}
    </div>
  );
}
