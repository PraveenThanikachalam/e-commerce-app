import { Button } from "./Button";
import image from "../../../public/Praveen.jpg";
import LikeButton from "../svgs/LikeButton";
import { useState } from "react";

export default function ItemCard({
    productName = "Name",
    price = 100,
    paise = "00",
    sizes = ["S", "M", "L", "XL", "XXL"],
}) {
    const [addWishList, setWishList] = useState(false);
    return (
        <div className="ui-w-[300px] ui-relative ui-h-[430px] ui-rounded-xl ui-text-[#DFD3CE] ui-bg-[#D9D9D9]/10">
            <div className="ui-w-full ui-h-[82%] ui-rounded-t-xl ui-absolute ui-flex ui-items-end ui-overflow-hidden">
                <img
                    loading="lazy"
                    decoding="async"
                    className="ui-w-full ui-h-full ui-bg-white ui-object-cover ui-rounded-t-xl ui-transition-transform ui-duration-300 hover:ui-scale-110"
                    src={image}
                    alt="Product"
                />
                <p className="ui-text-3xl ui-tracking-[2px] ui-pb-4 ui-absolute ui-pl-3">
                    {productName}
                </p>
                <button onClick={() => setWishList(!addWishList)}>
                    <LikeButton
                        className={`ui-absolute ui-top-5 ui-w-6 ui-h-6 ui-right-5`}
                        fillColor={addWishList ? `red` : "transparent"}
                    />
                </button>
            </div>
            <div className="ui-w-full ui-h-[90px] ui-bg-[#494848] ui-px-3 ui-py-2 ui-flex ui-items-center ui-justify-center ui-flex-col ui-gap-y-2 ui-rounded-xl ui-z-40 ui-absolute ui-bottom-0">
                <div className="ui-w-full ui-flex ui-items-end ui-justify-between">
                    <p className="ui-text-xl ui-tracking-[2px]">
                        {price}.{paise} - RS
                    </p>
                    <div className="ui-flex ui-justify-center ui-pb-[2px] ui-items-center ui-gap-2">
                        {sizes.map((size, idx) => (
                            <p key={idx} className="ui-text-sm ui-tracking-[1px]">
                                {size}
                            </p>
                        ))}
                    </div>
                </div>
                <div className="ui-w-full p-10 ui-flex ui-justify-between">
                    <Button
                        className="ui-w-auto ui-tracking-normal hover:ui-brightness-75 ui-transition-all ui-duration-100  ui-h-[35px] ui-text-sm ui-font-medium"
                        variant="buy_now"
                    >
                        BUY NOW
                    </Button>
                    <Button
                        variant="wishlist"
                        className="ui-w-auto ui-h-[35px] ui-tracking-normal hover:ui-brightness-75 ui-transition-all ui-duration-100"
                    >
                        Add to wishlist
                    </Button>
                </div>
            </div>
        </div>
    );
}
