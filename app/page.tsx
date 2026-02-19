import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LogoStrip from "./components/LogoStrip";
import Pillars from "./components/Pillars";
import HowItWorks from "./components/HowItWorks";
import Portfolio from "./components/Portfolio";
import Differentiators from "./components/Differentiators";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LogoStrip />
        <Pillars />
        <HowItWorks />
        <Portfolio />
        <Differentiators />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
