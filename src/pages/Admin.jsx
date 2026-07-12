import React from "react";
import AdminPanel from "../components/AdminPanel";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function Admin({ currentUser, onBypassAdmin }) {
  useDocumentMeta({ title: "Admin | Road Cruise", noindex: true });
  return (
    <AdminPanel
      currentUser={currentUser}
      onBypassAdmin={onBypassAdmin}
    />
  );
}
