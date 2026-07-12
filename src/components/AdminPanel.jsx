import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Building, Calendar, Car, ClipboardList, DollarSign, 
  MapPin, Plus, ShieldAlert, ShieldCheck, UserCheck, 
  UserPlus, Users, Trash2, Check, X 
} from "lucide-react";
import { fetchBookings, createBooking, updateBooking, deleteBooking } from "../utils/api";

// Initial seed bookings if localStorage is empty
const SEED_BOOKINGS = [
  {
    id: "RC-BK-9182",
    name: "Mohamed Vaseem",
    phone: "+91 98765 43210",
    fromDate: "2026-06-20",
    toDate: "2026-06-25",
    tripType: "Round-trip",
    item: "BMW 5 Series (Imperial Gold)",
    fare: 2400,
    status: "Approved",
    paymentMethod: "Card",
    driver: "Arjun Singh"
  },
  {
    id: "RC-BK-8712",
    name: "Anand Krishnan",
    phone: "+91 99404 11223",
    fromDate: "2026-06-22",
    toDate: "2026-06-24",
    tripType: "Tour Package",
    item: "Chennai - Pondy - Munnar",
    fare: 4800,
    status: "Pending",
    paymentMethod: "UPI (anand@okaxis)",
    driver: "None"
  },
  {
    id: "RC-BK-7651",
    name: "Deepa Ramakrishnan",
    phone: "+91 98401 77651",
    fromDate: "2026-06-15",
    toDate: "2026-06-18",
    tripType: "One-way",
    item: "Mercedes-Benz E-Class",
    fare: 1800,
    status: "Completed",
    paymentMethod: "Card",
    driver: "Karthik Raja"
  }
];

export default function AdminPanel({ currentUser, onBypassAdmin }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "bookings" | "fleet"
  const [bookings, setBookings] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    name: "",
    phone: "",
    fromDate: "",
    toDate: "",
    tripType: "Round-trip",
    item: "Mercedes-Benz E-Class",
    fare: 2000,
    paymentMethod: "Card"
  });

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to load bookings from backend:", error);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleBypass = () => {
    const adminUser = {
      name: "Admin Mohamed",
      email: "admin@roadcruise.com",
      role: "admin"
    };
    onBypassAdmin(adminUser);
  };

  // Check Authorization
  const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.email === "admin@roadcruise.com");

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-zinc-50 dark:bg-bg-dark transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-md w-full mx-4 p-8 glass-premium border border-zinc-200 dark:border-red-500/30 rounded-3xl shadow-2xl text-center space-y-6 relative z-10 bg-white/40 dark:bg-zinc-900/10">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 mx-auto animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-serif text-zinc-900 dark:text-white">Admin Credentials Required</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This dashboard is restricted to authorized operations administrators. Please authenticate or request bypass.
            </p>
          </div>
          <div className="p-4 bg-zinc-100 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-white/5 text-left font-mono text-[10px] text-zinc-500 space-y-1">
            <p className="font-bold text-zinc-700 dark:text-zinc-300">TEST ACCESS ACCOUNTS:</p>
            <p>Email: <span className="text-gold">admin@roadcruise.com</span></p>
            <p>Password: <span className="text-gold">admin123</span> (any password &gt; 5 char)</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleBypass}
              className="flex-1 py-3 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Bypass as Admin
            </button>
            <Link
              to="/"
              className="flex-1 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-white/5 font-bold rounded-xl text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Actions
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateBooking(id, { status: newStatus });
      loadBookings();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAssignDriver = async (id, driverName) => {
    try {
      await updateBooking(id, { driver: driverName });
      loadBookings();
    } catch (error) {
      console.error("Failed to assign driver:", error);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await deleteBooking(id);
      loadBookings();
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    if (!newBooking.name || !newBooking.fromDate || !newBooking.toDate) {
      alert("Name, From Date, and To Date are required.");
      return;
    }
    try {
      // Admin-entered bookings are recorded directly (no online payment step);
      // the admin controls the status from the dashboard.
      await createBooking({ ...newBooking, paymentMode: "arrival" });
      loadBookings();
      setShowAddForm(false);
      setNewBooking({
        name: "",
        phone: "",
        fromDate: "",
        toDate: "",
        tripType: "Round-trip",
        item: "Mercedes-Benz E-Class",
        fare: 2000,
        paymentMethod: "Card"
      });
    } catch (error) {
      console.error("Failed to add booking:", error);
    }
  };

  // Math Metrics
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter(b => b.status === "Approved").length;
  const activeFleetCount = 18; // Simulated static/dynamic fleet
  const totalRevenue = bookings
    .filter(b => b.status !== "Cancelled")
    .reduce((sum, b) => sum + Number(b.fare), 0);

  return (
    <div className="min-h-screen pt-28 pb-16 bg-zinc-50 dark:bg-bg-dark text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-white/5 pb-6 mb-8 gap-4">
          <div className="text-left space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-wide">Operations Control Desk</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Logged in as <span className="text-gold font-bold">{currentUser.name}</span> (Administrator)
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === "overview" 
                  ? "bg-gold text-zinc-950 border-gold shadow-md" 
                  : "bg-white/40 dark:bg-zinc-900/10 border-zinc-200 dark:border-white/5 hover:border-gold/20"
              }`}
            >
              Analytics Overview
            </button>
            <button 
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === "bookings" 
                  ? "bg-gold text-zinc-950 border-gold shadow-md" 
                  : "bg-white/40 dark:bg-zinc-900/10 border-zinc-200 dark:border-white/5 hover:border-gold/20"
              }`}
            >
              Bookings Logs ({totalBookings})
            </button>
            <button 
              onClick={() => setActiveTab("fleet")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === "fleet" 
                  ? "bg-gold text-zinc-950 border-gold shadow-md" 
                  : "bg-white/40 dark:bg-zinc-900/10 border-zinc-200 dark:border-white/5 hover:border-gold/20"
              }`}
            >
              Fleet Deployed
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="glass-premium p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 text-left flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Calculated Revenue</span>
                  <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-white">₹{totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold border border-gold/30">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* Total Bookings */}
              <div className="glass-premium p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 text-left flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Active Orders</span>
                  <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-white">{totalBookings} Reserved</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold border border-gold/30">
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>

              {/* Fleet Deployed */}
              <div className="glass-premium p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 text-left flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Active Deployed</span>
                  <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-white">{activeFleetCount} / 25 Cars</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold border border-gold/30">
                  <Car className="w-5 h-5" />
                </div>
              </div>

              {/* Active Admins */}
              <div className="glass-premium p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 text-left flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Verified Drivers</span>
                  <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-white">{approvedBookings} Assigned</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold border border-gold/30">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Custom SVG Revenue Analytics Trend */}
            <div className="glass-premium p-6 rounded-3xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 text-left space-y-6">
              <div>
                <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Monthly Billing Analytics (Jan - Jun)</h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Calculated based on booking values processed through prestige gateways.</p>
              </div>

              {/* Bar/SVG Chart layout */}
              <div className="h-64 flex items-end gap-3 sm:gap-6 justify-between pt-6 border-b border-zinc-200 dark:border-zinc-800 relative z-10 px-4">
                {/* Horizontal gridlines */}
                <div className="absolute inset-x-0 top-0 border-t border-dashed border-zinc-200 dark:border-zinc-800/60 z-0"></div>
                <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-zinc-200 dark:border-zinc-800/60 z-0"></div>
                <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-zinc-200 dark:border-zinc-800/60 z-0"></div>
                
                {[
                  { month: "Jan", val: "₹4.5L", height: "55%" },
                  { month: "Feb", val: "₹5.8L", height: "70%" },
                  { month: "Mar", val: "₹5.2L", height: "62%" },
                  { month: "Apr", val: "₹7.1L", height: "85%" },
                  { month: "May", val: "₹6.4L", height: "76%" },
                  { month: "Jun", val: "₹8.4L", height: "100%" }
                ].map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end relative z-10">
                    <span className="text-[8.5px] font-mono font-bold text-gold opacity-0 hover:opacity-100 transition-opacity mb-1.5">{item.val}</span>
                    <div 
                      className="w-full bg-gradient-to-t from-gold-dark via-gold to-amber-400 rounded-t-lg shadow-lg shadow-gold/5 group hover:opacity-90 transition-all cursor-pointer"
                      style={{ height: item.height }}
                    ></div>
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {activeTab === "bookings" && (
          <div className="space-y-6 animate-fade-in">
            {/* Table Control Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white tracking-wide text-left">Active Booking Logs</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showAddForm ? "Close Form" : "Add Booking"}
              </button>
            </div>

            {/* Manual Admin Reservation Form */}
            {showAddForm && (
              <form onSubmit={handleAddBooking} className="glass-premium p-6 rounded-2xl border border-gold/30 bg-gold/5 text-left grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newBooking.name}
                    onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={newBooking.fromDate}
                    onChange={(e) => setNewBooking({ ...newBooking, fromDate: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={newBooking.toDate}
                    onChange={(e) => setNewBooking({ ...newBooking, toDate: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Route Circuit / Vehicle</label>
                  <select
                    value={newBooking.item}
                    onChange={(e) => setNewBooking({ ...newBooking, item: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                  >
                    <option value="Mercedes-Benz E-Class">Mercedes E-Class</option>
                    <option value="Audi A6 Matrix">Audi A6</option>
                    <option value="BMW 5 Series">BMW 5 Series</option>
                    <option value="Chennai - Pondy - Munnar">Chennai-Pondy-Munnar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Calculated Fare (₹)</label>
                  <input
                    type="number"
                    value={newBooking.fare}
                    onChange={(e) => setNewBooking({ ...newBooking, fare: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Service Type</label>
                  <select
                    value={newBooking.tripType}
                    onChange={(e) => setNewBooking({ ...newBooking, tripType: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                  >
                    <option value="Round-trip">Round-trip</option>
                    <option value="One-way">One-way</option>
                    <option value="Tour Package">Tour Package</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    Inject Booking Record
                  </button>
                </div>
              </form>
            )}

            {/* Bookings Table Container */}
            <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/5 shadow-xl glass-premium bg-white/40 dark:bg-zinc-900/10">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-white/5 bg-zinc-550/10 dark:bg-zinc-950/20 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    <th className="p-4">ID</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Route / Service</th>
                    <th className="p-4">Duration Dates</th>
                    <th className="p-4">Fare (₹)</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Driver Assigned</th>
                    <th className="p-4 text-center">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-white/5 text-xs text-zinc-700 dark:text-zinc-300">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-zinc-400 italic">No bookings found in logs.</td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-mono font-bold text-zinc-900 dark:text-white">{b.id}</td>
                        <td className="p-4">
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">{b.name}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">{b.phone}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{b.item}</p>
                          <span className="text-[8px] bg-gold/10 text-gold px-1 rounded uppercase font-semibold">{b.tripType}</span>
                        </td>
                        <td className="p-4 font-mono text-[10px]">{b.fromDate} to {b.toDate}</td>
                        <td className="p-4 font-bold font-mono text-zinc-900 dark:text-white">₹{Number(b.fare).toLocaleString()}</td>
                        <td className="p-4 text-[10px] font-mono text-zinc-500">{b.paymentMethod || "Card"}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            b.status === "Approved" ? "bg-emerald-500/10 text-emerald-500" :
                            b.status === "Pending" ? "bg-amber-500/10 text-amber-500" :
                            b.status === "Completed" ? "bg-blue-500/10 text-blue-500" :
                            "bg-red-500/10 text-red-500"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={b.driver || "None"}
                            onChange={(e) => handleAssignDriver(b.id, e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-300 font-medium"
                          >
                            <option value="None">Unassigned</option>
                            <option value="Arjun Singh">Arjun Singh</option>
                            <option value="Ramesh Kumar">Ramesh Kumar</option>
                            <option value="Karthik Raja">Karthik Raja</option>
                            <option value="Sathish Nair">Sathish Nair</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 justify-center">
                            {b.status === "Pending" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "Approved")}
                                className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors"
                                title="Approve Booking"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {b.status !== "Cancelled" && b.status !== "Completed" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "Cancelled")}
                                className="p-1 text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                                title="Cancel Booking"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              title="Delete Log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FLEET DEPLOYED & TELEMETRY */}
        {activeTab === "fleet" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {[
              {
                id: "RC-CAR-01",
                model: "Mercedes-Benz E-Class",
                plate: "TN-07-CM-2401",
                driver: "Arjun Singh",
                speed: 76,
                coord: "12.9716° N, 80.2408° E",
                status: "Cruising",
                route: "Chennai to Pondicherry (ECR)",
                fuel: "82%"
              },
              {
                id: "RC-CAR-02",
                model: "Audi A6 Matrix",
                plate: "TN-10-AA-5812",
                driver: "Ramesh Kumar",
                speed: 42,
                coord: "10.0889° N, 77.0595° E",
                status: "Ascending Hairpins",
                route: "Pondicherry to Munnar Pass",
                fuel: "54%"
              },
              {
                id: "RC-CAR-03",
                model: "BMW 5 Series",
                plate: "KA-03-MK-7128",
                driver: "Karthik Raja",
                speed: 0,
                coord: "12.9602° N, 80.1805° E",
                status: "Idle / Garage",
                route: "None (Stationed in Chennai Terminal)",
                fuel: "98%"
              },
              {
                id: "RC-CAR-04",
                model: "Toyota Innova Crysta",
                plate: "TN-12-BB-8231",
                driver: "Sathish Nair",
                speed: 78,
                coord: "11.4102° N, 76.6950° E",
                status: "Cruising",
                route: "Outstation family cruise to Ooty",
                fuel: "70%"
              }
            ].map((car) => (
              <div 
                key={car.id} 
                className="glass-premium p-6 rounded-3xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 text-left space-y-4 flex flex-col justify-between hover:border-gold/30 hover:shadow-2xl transition-all duration-300"
              >
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-bold text-gold uppercase tracking-widest">{car.id} · {car.plate}</span>
                    <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white mt-0.5">{car.model}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                    car.speed > 0 ? "bg-emerald-500/10 text-emerald-500 animate-pulse" : "bg-zinc-500/10 text-zinc-500"
                  }`}>
                    {car.status}
                  </span>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-white/5 rounded-2xl p-4 font-mono text-[10px] text-zinc-500">
                  <div className="space-y-0.5">
                    <span>Driver Assigned:</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{car.driver}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span>Live GPS Speed:</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{car.speed} km/h</p>
                  </div>
                  <div className="space-y-0.5">
                    <span>Active Route:</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[130px]">{car.route}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span>Coordinates:</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{car.coord}</p>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <div className="flex justify-between">
                      <span>Fuel Autonomy:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{car.fuel}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-gold rounded-full" style={{ width: car.fuel }}></div>
                    </div>
                  </div>
                </div>

                {/* Telemetry link control */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => alert(`Connecting securely to vehicle telemetry camera feed for ${car.plate}...`)}
                    className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-white/5 text-white font-bold rounded-xl text-[9px] uppercase tracking-wider transition-all"
                  >
                    Cabin Feed
                  </button>
                  <button 
                    onClick={() => alert(`Coordinates mapping requested. Active telemetry signal: ${car.coord}`)}
                    className="flex-1 py-1.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-xl text-[9px] uppercase tracking-wider transition-all"
                  >
                    Track Route Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
