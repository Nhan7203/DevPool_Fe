import React from "react";
import HeroSection from "../../../components/home/HeroSection";
import StatsSection from "../../../components/home/StatsSection";
import FeaturesSection from "../../../components/home/FeaturesSection";
import CategoriesSection from "../../../components/home/CategoriesSection";
import TestimonialsSection from "../../../components/home/TestimonialsSection";
import HowItWorksSection from "../../../components/home/HowItWorksSection";
import CTASection from "../../../components/home/CTASection";


const HomePage: React.FC = () => {
  
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CategoriesSection />
      <TestimonialsSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
