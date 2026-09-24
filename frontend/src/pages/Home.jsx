
import Hero from '../components/Hero.jsx';
import TrustSection from '../components/TrustSection.jsx';
import MembershipPreview from '../components/MembershipPreview.jsx';
import ProgramsSection from '../components/ProgramsSection.jsx';
import FeaturesSection from '../components/FeaturesSection.jsx';
import EquipmentSection from '../components/EquipmentSection.jsx';
import TrainersSection from '../components/TrainersSection.jsx';
import TimeSlotsSection from '../components/TimeSlotsSection.jsx';
import StatsSection from '../components/StatsSection.jsx';
import ProgramRows from '../components/ProgramRows.jsx';
import TestimonialsSection from '../components/TestimonialsSection.jsx';
import MembershipCTA from '../components/MembershipCTA.jsx';
import LocationSection from '../components/LocationSection.jsx';
import Footer from '../components/Footer.jsx';
import { Reveal } from '../hooks/useReveal.jsx';

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <TrustSection />
        <MembershipPreview />
        <Reveal><ProgramsSection /></Reveal>
        <Reveal><TrainersSection /></Reveal>
        <Reveal><TimeSlotsSection /></Reveal>
        <Reveal><StatsSection /></Reveal>
        <Reveal><FeaturesSection /></Reveal>
        <Reveal><EquipmentSection /></Reveal>
        <Reveal><ProgramRows /></Reveal>
        <Reveal><TestimonialsSection /></Reveal>
        <Reveal><MembershipCTA /></Reveal>
        <Reveal><LocationSection /></Reveal>
      </main>
      <Footer />
    </>
  );
}


