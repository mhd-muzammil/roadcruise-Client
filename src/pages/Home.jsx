import React from "react";
import Hero from "../components/Hero";
import Reviews from "../components/Reviews";
import Stories from "../components/Stories";

export default function Home({ onBookNowClick }) {
  return (
    <>
      <Hero onBookNowClick={onBookNowClick} />
      <Stories />
      <Reviews />
    </>
  );
}
