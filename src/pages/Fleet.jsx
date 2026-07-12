import React from "react";
import FleetComponent from "../components/Fleet";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function Fleet({ onBookNowClick }) {
  useDocumentMeta({
    title: "Car, Tempo Traveller & Bus Rental in Chennai | Road Cruise",
    description:
      "Rent chauffeur-driven sedans, Innova Crysta, tempo travellers & mini buses in Chennai. Outstation from ₹14/km, local packages from ₹1,250.",
  });
  return <FleetComponent onBookNowClick={onBookNowClick} />;
}
