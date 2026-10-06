import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { LandingHero } from '../components/LandingHero';
import { AboutSection } from '../components/AboutSection';
import { ServicesGrid } from '../components/ServicesGrid';
import { EventsSection } from '../components/EventsSection';
import { JobsSection } from '../components/JobsSection';
import { CommunitySection } from '../components/CommunitySection';
import { CommitteeSection } from '../components/CommitteeSection';
import { MembershipBenefitsSection } from '../components/MembershipBenefitsSection';
import { ContactSection } from '../components/ContactSection';
import { InstitutionalFooter } from '../components/InstitutionalFooter';

export function PublicHome() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    } else if (location.pathname === '/about') {
      const el = document.getElementById('about');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    }
  }, [location]);
  return (
    <div className="min-h-screen w-full bg-[#F5EAD8] text-[#201E1D] flex flex-col justify-between selection:bg-[#C67139] selection:text-[#F9F4ED]">
      {/* 1. Official Sticky Institutional Navbar */}
      <Navbar />

      {/* Main Page Flow */}
      <main className="flex-1 w-full">
        {/* 2. Institutional Hero Section */}
        <LandingHero />

        {/* 3. Official About Section (Scraped from iei-kuwait.org) */}
        <AboutSection />

        {/* 4. Quick-Access Services & Chapter Hubs Grid */}
        <ServicesGrid />

        {/* 4. Upcoming Programmes & Seminars (59th Engineers' Day, AI Facilities, UTSAV) */}
        <EventsSection />

        {/* 5. Engineering Career Opportunities (KOC, KEO, Combined Group) */}
        <JobsSection />

        {/* 6. Chapter Community: Mentorship Directory & Emergency Blood Donors Register */}
        <CommunitySection />

        {/* 7. Executive Committee Leadership */}
        <CommitteeSection />

        {/* 8. Why Join & Annual Dues Policy */}
        <MembershipBenefitsSection />

        {/* 9. Contact Coordinates & KSE Location */}
        <ContactSection />
      </main>

      {/* 10. Official Institutional Footer */}
      <InstitutionalFooter />
    </div>
  );
}

export default PublicHome;
