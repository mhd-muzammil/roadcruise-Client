import React from "react";
import AdminPanel from "../components/AdminPanel";

export default function Admin({ currentUser, onBypassAdmin }) {
  return (
    <AdminPanel 
      currentUser={currentUser} 
      onBypassAdmin={onBypassAdmin} 
    />
  );
}
