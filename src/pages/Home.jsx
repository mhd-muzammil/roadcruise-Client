import React from "react";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Reviews from "../components/Reviews";
import Stories from "../components/Stories";
import Recognition from "../components/Recognition";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function Home({ onBookNowClick }) {
  useDocumentMeta({
    title: "Road Cruise | Car Rentals & Tours in Chennai, South India",
    description:
      "Chauffeur-driven car rentals from ₹14/km and curated tour packages across South India. GPS-tracked fleet, verified drivers, 24/7 support. Book online.",
    canonical: "/",
  });
  return (
    <>
      <Hero onBookNowClick={onBookNowClick} />
      <Recognition />
      <Services onBookNowClick={onBookNowClick} />
      <Stories />
      <Reviews />
    </>
  );
}
