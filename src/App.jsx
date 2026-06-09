import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import ScrollToTop from "./components/common/ScrollToTop";

// Page Imports
import Home from "./pages/Home";
import About from "./pages/About";
import ToursTravels from "./pages/ToursTravels";
import Contact from "./pages/Contact";
import Fleet from "./pages/Fleet";
import Blog from "./pages/Blog";

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
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-zinc-50 dark:bg-bg-dark text-zinc-900 dark:text-white font-sans selection:bg-gold selection:text-zinc-950 overflow-x-hidden transition-colors duration-300">
        {/* Sticky Luxury Navbar */}
        <Navbar 
          onBookNowClick={openBooking} 
          isDarkMode={isDarkMode} 
          onThemeToggle={toggleTheme} 
        />

        <Routes>
          <Route path="/" element={<Home onBookNowClick={openBooking} />} />
          <Route path="/about" element={<About />} />
          <Route path="/vehicles" element={<Fleet onBookNowClick={openBooking} />} />
          <Route path="/tours-travels" element={<ToursTravels onBookNowClick={openBooking} />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>

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
    </Router>
  );
}
