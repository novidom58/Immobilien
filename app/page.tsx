import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { RoomFlythrough } from "@/components/sections/RoomFlythrough";
import { UspMarquee } from "@/components/sections/UspMarquee";
import { TrustBar } from "@/components/sections/TrustBar";
import { WhyNoviDom } from "@/components/sections/WhyNoviDom";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { SalesCockpit } from "@/components/sections/SalesCockpit";
import { CommissionCompare } from "@/components/sections/CommissionCompare";
import { Situations } from "@/components/sections/Situations";
import { StatsAndArea } from "@/components/sections/StatsAndArea";
import { AboutJana } from "@/components/sections/AboutJana";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <RoomFlythrough />
        <UspMarquee />
        <TrustBar />
        <WhyNoviDom />
        <Services />
        <Process />
        <SalesCockpit />
        <CommissionCompare />
        <Situations />
        <StatsAndArea />
        <AboutJana />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
