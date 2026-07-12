import React, { useState, useEffect, lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./components/common/ScrollToTop";

// Page Imports — primary landing routes stay eager; the rest are
// code-split so their JS never blocks first paint of the home page.
import Home from "./pages/Home";
import About from "./pages/About";
import ToursTravels from "./pages/ToursTravels";
import Contact from "./pages/Contact";
import Fleet from "./pages/Fleet";
const Blog = lazy(() => import("./pages/Blog"));
const Admin = lazy(() => import("./pages/Admin"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Refund = lazy(() => import("./pages/Refund"));
const FAQ = lazy(() => import("./pages/FAQ"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("rc_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync theme selection to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Accepts either a plain name (+type) — e.g. the header "Book Now" and Services
  // cards — or a rich item object { name, type, vehicle?, pkg? } from the Fleet /
  // Packages cards so the modal can render context-specific fields.
  const openBooking = (itemOrName, type = "vehicle") => {
    const item =
      itemOrName && typeof itemOrName === "object"
        ? { type: "vehicle", ...itemOrName }
        : { name: itemOrName, type };
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("rc_user", JSON.stringify(user));
    if (user.role === "admin") {
      window.location.hash = "#/admin";
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("rc_user");
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
          currentUser={currentUser}
          onAuthClick={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        <main>
        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home onBookNowClick={openBooking} />} />
          <Route path="/about" element={<About />} />
          <Route path="/vehicles" element={<Fleet onBookNowClick={openBooking} />} />
          <Route path="/tours-travels" element={<ToursTravels onBookNowClick={openBooking} />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route
            path="/my-bookings"
            element={
              <MyBookings
                currentUser={currentUser}
                onAuthClick={() => setIsAuthOpen(true)}
                onSessionExpired={handleLogout}
              />
            }
          />
          <Route
            path="/reset-password"
            element={<ResetPassword onAuthClick={() => setIsAuthOpen(true)} />}
          />
          <Route
            path="/verify-email"
            element={<VerifyEmail onAuthClick={() => setIsAuthOpen(true)} />}
          />
          <Route path="/admin" element={<Admin currentUser={currentUser} onBypassAdmin={handleAuthSuccess} />} />
          {/* Unknown hash routes (typo'd or truncated emailed links, retired
              paths) land on Home instead of an empty page. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
        </main>

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
          currentUser={currentUser}
          onAuthTrigger={() => setIsAuthOpen(true)}
          onSessionExpired={handleLogout}
        />

        {/* Authentication Modal */}
        <AuthModal 
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </Router>
  );
}
