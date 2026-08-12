import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { UspMarquee } from "@/components/sections/UspMarquee";
import { TrustBar } from "@/components/sections/TrustBar";
import { FeaturedListings } from "@/components/sections/FeaturedListings";
import { WhyNoviDom } from "@/components/sections/WhyNoviDom";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { SalesCockpit } from "@/components/sections/SalesCockpit";
import { CommissionCompare } from "@/components/sections/CommissionCompare";
import { ProceedsCalculator } from "@/components/sections/ProceedsCalculator";
import { Situations } from "@/components/sections/Situations";
import { StatsAndArea } from "@/components/sections/StatsAndArea";
import { ServiceMap } from "@/components/sections/ServiceMap";
import { AboutJana } from "@/components/sections/AboutJana";
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
        <WhyNoviDom />
        <Services />
        <Process />
        <CommissionCompare />
        <ProceedsCalculator />
        <Situations />
        <StatsAndArea />
        <ServiceMap />
        <AboutJana />
        <SalesCockpit />
        <Faq />
        <BookingSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
