import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { usePageNavigation } from '../context/NavigationContext';

import { HomeHeroSection } from '../components/home/HomeHeroSection';
import { HomeDiscoverServices } from '../components/home/HomeDiscoverServices';
import { HomeSearchSection } from '../components/home/HomeSearchSection';
import { HomeConnectedEcosystem } from '../components/home/HomeConnectedEcosystem';
import { HomeAnimalWelfareSection } from '../components/home/HomeAnimalWelfareSection';
import { HomeWhyChooseUs } from '../components/home/HomeWhyChooseUs';
import { HomeOnboardingCTA } from '../components/home/HomeOnboardingCTA';
import { Footer } from '../components/Footer';


export const HomePage = () => {
  const { user, activeRole } = useAuth();
  const { showAlert } = useNotification();
  const { registerSections } = usePageNavigation();
  const navigate = useNavigate();

  // Canonical Sections for Landing Page Navigation
  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'find-care', label: 'Find Care' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'animal-welfare', label: 'Adoption & Rescue' },
    { id: 'why-jiva-thunai', label: 'Why Jiva Thunai' },
    { id: 'join-us', label: 'Join Community' }
  ];

  useEffect(() => {
    registerSections(sections);
    return () => registerSections([]);
  }, []);

  const handleRestrictedAction = (tabName) => {
    if (!user) {
      showAlert(
        'Authentication Required',
        `Please Sign In or Register to access adoption applications, digital Pet Profiles, and medical health records under PCA Act 1960 safety guidelines.`,
        'warning',
        () => navigate('/login')
      );
    } else {
      navigate(`/${tabName}`);
    }
  };

  return (
    <div className="w-full flex flex-col">

      {/* 01. Hero — #home (1st section: Medium Green UI Gradient) */}
      <section id="home" className="scroll-mt-28 w-full bg-gradient-to-b from-emerald-100/90 via-teal-100/60 to-emerald-50/70 border-b border-emerald-200/50">
        <HomeHeroSection 
          user={user} 
          onRestrictedAction={handleRestrictedAction} 
        />
      </section>

      {/* 02. Discover Services — #services (2nd section: Light Green UI Gradient) */}
      <section id="services" className="scroll-mt-28 w-full bg-gradient-to-b from-emerald-50/50 via-teal-50/20 to-white border-b border-emerald-100/60 py-16 sm:py-20">
        <div className="px-4 sm:px-8 lg:px-12 w-full">
          <HomeDiscoverServices />
        </div>
      </section>

      {/* 03. Find Care Near You — #find-care (3rd section: Medium Green UI Gradient) */}
      <section id="find-care" className="scroll-mt-28 w-full bg-gradient-to-b from-emerald-100/80 via-teal-100/50 to-emerald-50/70 border-b border-emerald-200/50 py-16 sm:py-20">
        <div className="px-4 sm:px-8 lg:px-12 w-full">
          <HomeSearchSection />
        </div>
      </section>

      {/* 04. How Jiva Thunai Works — #how-it-works (4th section: Light Green UI Gradient) */}
      <section id="how-it-works" className="scroll-mt-28 w-full bg-gradient-to-b from-emerald-50/50 via-teal-50/20 to-white border-b border-emerald-100/60 py-16 sm:py-20">
        <div className="px-4 sm:px-8 lg:px-12 w-full">
          <HomeConnectedEcosystem />
        </div>
      </section>

      {/* 05. Adoption, Rescue and Lost Pets — #animal-welfare (5th section: Medium Green UI Gradient) */}
      <section id="animal-welfare" className="scroll-mt-28 w-full bg-gradient-to-b from-emerald-100/80 via-teal-100/50 to-emerald-50/70 border-b border-emerald-200/50 py-16 sm:py-20">
        <div className="px-4 sm:px-8 lg:px-12 w-full">
          <HomeAnimalWelfareSection />
        </div>
      </section>

      {/* 06. Why Choose Jiva Thunai — #why-jiva-thunai (6th section: Light Green UI Gradient) */}
      <section id="why-jiva-thunai" className="scroll-mt-28 w-full bg-gradient-to-b from-emerald-50/50 via-teal-50/20 to-white border-b border-emerald-100/60 py-16 sm:py-20">
        <div className="px-4 sm:px-8 lg:px-12 w-full">
          <HomeWhyChooseUs />
        </div>
      </section>

      {/* 07. Join the Jiva Thunai Community — #join-us (7th section: Medium Green UI Gradient) */}
      <section id="join-us" className="scroll-mt-28 w-full bg-gradient-to-b from-emerald-100/80 via-teal-100/50 to-emerald-50/70 py-16 sm:py-20">
        <div className="px-4 sm:px-8 lg:px-12 w-full">
          <HomeOnboardingCTA />
        </div>
      </section>

      {/* Render Footer when authenticated user is previewing public HomePage */}
      {user && <Footer />}

    </div>
  );
};
