import { Navbar } from "./components/Organisms/Navbar";
import HomePageContent from "./components/Organisms/HomePage";

export default function Home() {
  return (
    <div className="ui-flex ui-h-screen ui-w-[100vw] ui-overflow-x-hidden ui-overflow-y-visible ui-bg-[#1B1A2C]">
      <div className="ui-fixed ui-box-border ui-w-full">
        <Navbar />
      </div>

      <div className="ui-mt-[92px] ui-h-[calc(100vh-92px)] ui-w-full ui-p-4 lg:ui-px-16 lg:ui-py-14">
        <HomePageContent />
      </div>
    </div>
  );
}
