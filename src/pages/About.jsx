import React from "react";
import AboutComponent from "../components/About";
import Reviews from "../components/Reviews";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function About() {
  useDocumentMeta({
    title: "About Road Cruise | Govt. Recognized Travel Company",
    description:
      "Ministry of Tourism recognized, ISO 9001:2015 certified car rental & tour operator in Chennai. 25+ premium vehicles, 10,000+ happy travellers.",
    canonical: "/about",
  });
  return (
    <>
      <AboutComponent />
      <Reviews />
    </>
  );
}
