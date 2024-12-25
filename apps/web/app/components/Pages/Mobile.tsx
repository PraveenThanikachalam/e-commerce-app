import Image from "next/image";
import SamplePic from "../../../public/Praveen.jpg";

function MobileHomePage() {
    return (
        <div className="ui-just-end ui-grid ui-h-full ui-w-[100vw] ui-grid-rows-3 ui-justify-center ui-gap-4">
            <div className="ui-grid ui-h-full ui-w-full ui-grid-cols-2 ui-gap-3">
                <div className="ui-overflow-hidden ui-rounded-lg ui-bg-white">
                    <Image
                        className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
                        src={SamplePic}
                        alt={""}
                    />
                </div>
                <div className="ui-overflow-hidden ui-rounded-lg ui-bg-white">
                    <Image
                        className="ui-h-full ui-w-full ui-rounded-lg ui-object-cover"
                        src={SamplePic}
                        alt={""}
                    />
                </div>
            </div>
            <div className="ui-h-full ui-w-full ui-rounded-xl ui-bg-white/10"></div>
            <div className="ui-h-full ui-w-full ui-rounded-xl ui-bg-white/10"></div>
        </div>
    );
}

export default MobileHomePage;
