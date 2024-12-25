import Image from "next/image";
import HeroHighLighter from "@repo/ui/components/svgs/HeroHighLighter";
import SamplePic from "../../../public/Praveen.jpg";

function LargeScrHomePage() {
  return (
    <div className="ui-flex ui-h-full ui-w-full ui-flex-col ui-items-center ui-justify-center lg:ui-gap-5 xl:ui-justify-start">
      <div className="ui-flex ui-w-full ui-flex-col ui-items-start ui-gap-y-4 ui-bg-gradient-to-b ui-from-[#F07E2E] ui-to-[#F56D32] ui-bg-clip-text ui-text-transparent">
        <h1 className="ui-ml-5 ui-text-[3vw] ui-font-thin ui-italic ui-tracking-[2vw]">
          JAW <br className="flex md:ui-hidden" /> DROPPING
        </h1>
        <h1 className="ui-mr-14 ui-w-auto ui-text-[6vw] ui-font-bold ui-italic ui-tracking-[2vw]">
          CO<span className="L-Span">LL</span>ECTIONS
          <div className="ui-w-[60vw] -ui-translate-y-[2vh] lg:-ui-translate-y-[4vh]">
            <HeroHighLighter />
          </div>
        </h1>
      </div>
      <div className="ui-grid ui-h-full ui-w-full ui-grid-cols-2 ui-gap-3">
        <div className="ui-grid ui-grid-cols-2 ui-gap-3">
          <div className="ui-grid ui-max-h-[400px] ui-grid-rows-2 ui-gap-3 ui-rounded-lg">
            <div className="ui-h-full ui-rounded-lg ui-bg-black">
              <Image
                className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
                src={SamplePic}
                alt={""}
              ></Image>
            </div>
            <div className="ui-h-full ui-rounded-lg ui-bg-black">
              <Image
                className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
                src={SamplePic}
                alt={""}
              ></Image>
            </div>
          </div>
          <div className="ui-flex ui-max-h-[400px] ui-flex-col ui-gap-3 ui-rounded-lg lg:ui-flex-row">
            <div className="ui-grid ui-w-[100%] ui-grid-rows-5 ui-gap-3">
              <div className="ui-h-full ui-w-full ui-rounded-lg ui-bg-white">
                <Image
                  src={SamplePic}
                  alt=""
                  className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
                />
              </div>
              <div className="ui-h-full ui-w-full ui-rounded-lg ui-bg-white">
                <Image
                  src={SamplePic}
                  alt=""
                  className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
                />
              </div>
              <div className="ui-h-full ui-w-full ui-rounded-lg ui-bg-white">
                <Image
                  src={SamplePic}
                  alt=""
                  className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
                />
              </div>
              <div className="ui-h-full ui-w-full ui-rounded-lg ui-bg-white">
                <Image
                  src={SamplePic}
                  alt=""
                  className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
                />
              </div>
              <div className="ui-h-full ui-w-full ui-rounded-lg ui-bg-white">
                <Image
                  src={SamplePic}
                  alt=""
                  className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
                />
              </div>
            </div>
            <div className="ui-h-full ui-w-full ui-rounded-lg ui-bg-white">
              <Image
                src={SamplePic}
                alt=""
                className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
              />
            </div>
          </div>
        </div>
        <div className="ui-grid ui-grid-cols-2 ui-gap-3">
          <div className="ui-grid ui-max-h-[400px] ui-grid-rows-2 ui-gap-2 ui-rounded-lg">
            <div className="ui-rounded-lg ui-bg-black">
              <Image
                src={SamplePic}
                alt=""
                className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
              />
            </div>
            <div className="ui-rounded-lg ui-bg-black">
              <Image
                src={SamplePic}
                alt=""
                className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
              />
            </div>
          </div>
          <div className="ui-max-h-[400px] ui-rounded-lg ui-bg-white">
            <Image
              src={SamplePic}
              alt=""
              className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LargeScrHomePage;
