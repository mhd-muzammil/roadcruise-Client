import React, { useState, useEffect } from "react";
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sync theme selection to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const openBooking = (name, type = "vehicle") => {
    setSelectedItem({ name, type });
    setIsModalOpen(true);
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-bg-dark text-zinc-900 dark:text-white font-sans selection:bg-gold selection:text-zinc-950 overflow-x-hidden transition-colors duration-300">
      {/* Sticky Luxury Navbar */}
      <Navbar 
        onBookNowClick={openBooking} 
        isDarkMode={isDarkMode} 
        onThemeToggle={toggleTheme} 
      />

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
