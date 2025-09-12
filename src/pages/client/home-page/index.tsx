import React from "react";
import HeroSection from "../../../components/home/HeroSection";
import FeaturesSection from "../../../components/home/FeaturesSection";
import CategoriesSection from "../../../components/home/CategoriesSection";
import TestimonialsSection from "../../../components/home/TestimonialsSection";
import HowItWorksSection from "../../../components/home/HowItWorksSection";
import CTASection from "../../../components/home/CTASection";
import ExpertsSection from "../../../components/home/ExpertsSection";
import CompaniesSection from "../../../components/home/CompaniesSection";


const HomePage: React.FC = () => {
  
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />    
      <FeaturesSection />
      <CategoriesSection />
      <CompaniesSection/>
      <ExpertsSection/>
      <TestimonialsSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
