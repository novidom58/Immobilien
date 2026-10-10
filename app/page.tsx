import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { UspMarquee } from "@/components/sections/UspMarquee";
import { TrustBar } from "@/components/sections/TrustBar";
import { SolutionsHub } from "@/components/sections/SolutionsHub";
import { BuyerRadar } from "@/components/sections/BuyerRadar";
import { FeaturedListings } from "@/components/sections/FeaturedListings";
import { WhyNoviDom } from "@/components/sections/WhyNoviDom";
import { PropertyValuationLead } from "@/components/sections/PropertyValuationLead";
import { ServiceMap } from "@/components/sections/ServiceMap";
import { AboutJana } from "@/components/sections/AboutJana";
import { Faq } from "@/components/sections/Faq";
import { BookingSection } from "@/components/sections/BookingSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { getShowcase } from "@/lib/showcase";

export default async function Home() {
  const showcase = await getShowcase();

  return (
    <>
      <Header />
      <main>
        <Hero showcase={showcase} />
        <UspMarquee />
        <TrustBar />
        <SolutionsHub />
        <BuyerRadar />
        <FeaturedListings />
        <WhyNoviDom />
        <PropertyValuationLead />
        <ServiceMap />
        <AboutJana />
        <Faq />
        <BookingSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
