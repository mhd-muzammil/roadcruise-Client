import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser } from "../utils/api";
import GoogleSignInButton from "./common/GoogleSignInButton";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState("signin"); // "signin" | "signup"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: ""
      });
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Stealth Admin Password verification
    if (activeTab === "signin" && formData.email.trim() === "admin@roadcruise.com") {
      if (formData.password !== "admin123") {
        newErrors.password = "Incorrect password for administrator account";
      }
    }

    if (activeTab === "signup") {
      if (!formData.name.trim()) {
        newErrors.name = "Full name is required";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\+?[0-9\s-]{10,14}$/.test(formData.phone.trim())) {
        newErrors.phone = "Enter a valid phone number (min 10 digits)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        let userPayload;
        if (activeTab === "signin") {
          userPayload = await loginUser(formData.email, formData.password);
        } else {
          userPayload = await registerUser(formData.name, formData.email, formData.phone, formData.password);
        }
        onAuthSuccess(userPayload);
        onClose();
      } catch (err) {
        setErrors({ general: err.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 dark:bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold/30 shadow-2xl shadow-gold/5 flex flex-col max-h-[90vh]">
        
        {/* Header Tabs */}
        <div className="flex border-b border-zinc-100 dark:border-white/5 relative">
          <button
            onClick={() => {
              setActiveTab("signin");
              setErrors({});
            }}
            className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${
              activeTab === "signin" 
                ? "text-gold border-b-2 border-gold font-bold" 
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setErrors({});
            }}
            className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${
              activeTab === "signup" 
                ? "text-gold border-b-2 border-gold font-bold" 
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            Sign Up
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 text-zinc-400 hover:text-gold hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-all"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold text-center leading-relaxed">
                {errors.general}
              </div>
            )}
            
            {/* Sign Up Exclusive: Full Name */}
            {activeTab === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                      errors.name ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                    } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. name@example.com"
                  className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                    errors.email ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Sign Up Exclusive: Phone Number */}
            {activeTab === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                      errors.phone ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                    } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                    errors.password ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-gold"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer"
            >
              {activeTab === "signin" ? "Sign In to Cruise" : "Create Luxury Account"}
            </button>
          </form>

          {/* Continue with Google (additive — existing email/password flow above is unchanged) */}
          <GoogleSignInButton
            onAuthSuccess={onAuthSuccess}
            onClose={onClose}
            onError={(msg) => setErrors({ general: msg })}
          />

          {/* Quick Mock Login Notice */}
          <div className="mt-4 text-center">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic block">
              Mock auth environment active. Any email & password (min 6 char) will register/log in.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
