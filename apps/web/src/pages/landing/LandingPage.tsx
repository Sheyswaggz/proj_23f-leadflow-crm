import Navbar from './Navbar';
import HeroSection from './HeroSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <main id="features" />
    </div>
  );
}
