import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Fleet from "./components/Fleet";
import Destinations from "./components/Destinations";
import Packages from "./components/Packages";
import Stories from "./components/Stories";
import About from "./components/About";
import Reviews from "./components/Reviews";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openBooking = (name, type = "vehicle") => {
    setSelectedItem({ name, type });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans selection:bg-gold selection:text-zinc-950 overflow-x-hidden">
      {/* Sticky Luxury Navbar */}
      <Navbar onBookNowClick={openBooking} />

      {/* Hero Section */}
      <Hero onBookNowClick={openBooking} />

      {/* Fleet Section */}
      <Fleet onBookNowClick={openBooking} />

      {/* Destinations Section */}
      <Destinations />

      {/* Packages Section */}
      <Packages onBookNowClick={openBooking} />

      {/* Stories Section */}
      <Stories />

      {/* About Section */}
      <About />

      {/* Reviews Section */}
      <Reviews />

      {/* Footer Section */}
      <Footer />

      {/* Luxury Booking Dialog Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        selectedItem={selectedItem}
      />
    </div>
  );
}