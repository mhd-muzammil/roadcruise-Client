import React from "react";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Reviews from "../components/Reviews";
import Stories from "../components/Stories";

export default function Home({ onBookNowClick }) {
  return (
    <>
      <Hero onBookNowClick={onBookNowClick} />
      <Services onBookNowClick={onBookNowClick} />
      <Stories />
      <Reviews />
    </>
  );
}
