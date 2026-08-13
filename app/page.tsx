import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { UspMarquee } from "@/components/sections/UspMarquee";
import { TrustBar } from "@/components/sections/TrustBar";
import { FeaturedListings } from "@/components/sections/FeaturedListings";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { WhyNoviDom } from "@/components/sections/WhyNoviDom";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { PropertyValuationLead } from "@/components/sections/PropertyValuationLead";
import { SalesCockpit } from "@/components/sections/SalesCockpit";
import { ProvisionsRechner } from "@/components/sections/ProvisionsRechner";
import { Situations } from "@/components/sections/Situations";
import { StatsAndArea } from "@/components/sections/StatsAndArea";
import { ServiceMap } from "@/components/sections/ServiceMap";
import { AboutJana } from "@/components/sections/AboutJana";
import { RatgeberTeaser } from "@/components/sections/RatgeberTeaser";
import { Faq } from "@/components/sections/Faq";
import { BookingSection } from "@/components/sections/BookingSection";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <UspMarquee />
        <TrustBar />
        <FeaturedListings />
        <ProblemSolution />
        <WhyNoviDom />
        <Services />
        <Process />
        <PropertyValuationLead />
        <ProvisionsRechner />
        <Situations />
        <StatsAndArea />
        <ServiceMap />
        <AboutJana />
        <RatgeberTeaser />
        <SalesCockpit />
        <Faq />
        <BookingSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
