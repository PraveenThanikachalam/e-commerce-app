"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../../public/Logo[Proven].png";
import LogoHighLighter from "@repo/ui/components/svgs/LogoHighLighter";
import { HamburgerMenu } from "../Atoms/Hamburger";
import Link from "next/link";

const menuItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut",
        },
    }),
};

export const Navbar = ({ inbag = 0 }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathName = usePathname();
    const Links = [
        { href: "/", name: "Products" },
        { href: "/aboutus", name: "About us" },
        { href: "", name: "Categories" },
    ];

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "visible";
        }

        return () => {
            document.body.style.overflow = "visible";
        };
    }, [isMenuOpen]);

    return (
        <>
            <div className="navbar ui-flex ui-h-[92px] ui-w-full ui-items-center ui-justify-between ui-bg-transparent ui-backdrop-blur-lg">
                <div className="ui-flex ui-w-full ui-items-center ui-justify-between ui-border-b ui-border-white/20 ui-p-6 lg:ui-justify-start">
                    <Link
                        className="ui-flex ui-h-full ui-flex-col ui-items-start ui-justify-center"
                        href={"/"}
                    >
                        <Image className="ui-w-[110px]" src={Logo} alt="Logo" />
                        <LogoHighLighter />
                    </Link>
                    <div className="ui-flex lg:ui-hidden">
                        <HamburgerMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
                    </div>
                    <div className="ui-ml-10 ui-hidden ui-gap-10 lg:ui-flex">
                        {Links.map((item, idx) => (
                            <div key={idx}>
                                <a
                                    className={
                                        pathName === item.href
                                            ? `ui-text-[20px] ui-tracking-widest ui-text-orange-400 ui-transition-colors ui-duration-100 hover:ui-text-orange-400`
                                            : "ui-text-[20px] ui-tracking-widest ui-text-[#DFD3CE] ui-transition-colors ui-duration-100 hover:ui-text-orange-400"
                                    }
                                    href={item.href}
                                >
                                    {item.name}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="ui-hidden ui-h-full ui-w-auto ui-items-center lg:ui-flex xl:ui-w-full">
                    <div className="ui-flex ui-h-full ui-w-full ui-items-center ui-border-b ui-border-l ui-border-r ui-border-white/20 ui-px-10">
                        <a
                            className="ui-flex ui-w-full ui-items-center ui-justify-center ui-text-[20px] ui-tracking-widest ui-text-[#DFD3CE] ui-transition-colors ui-duration-300 hover:ui-text-orange-400"
                            href=""
                        >
                            <span className="ui-flex ui-items-center ui-gap-1 ui-whitespace-nowrap">
                                <span>BAG -</span>
                                <span className="ui-inline-block">[ {inbag} ]</span>
                            </span>
                        </a>
                    </div>
                    <div className="ui-flex ui-h-full ui-w-full ui-items-center ui-justify-center ui-border-b ui-border-l ui-border-white/20 ui-p-8">
                        <a
                            className="ui-ml-3 ui-flex ui-items-center ui-bg-gradient-to-b ui-from-[#F07E2E] ui-to-[#F56D32] ui-bg-clip-text ui-text-2xl ui-font-bold ui-tracking-[10px] ui-text-[#DFD3CE] ui-text-transparent ui-transition-opacity ui-duration-300 hover:ui-opacity-80"
                            href=""
                        >
                            LOGIN
                        </a>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 500, damping: 60 }}
                        className="ui-fixed ui-inset-0 ui-left-0 ui-top-[92px] ui-z-40 ui-flex ui-h-[calc(100vh-92px)] ui-w-screen ui-flex-col ui-overflow-y-auto ui-border-t ui-border-white/10 ui-bg-black/50 ui-p-6 ui-shadow-lg ui-backdrop-blur-lg"
                    >
                        {Links.map((item, idx) => (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={menuItemVariants}
                                initial="hidden"
                                animate="visible"
                                className="ui-flex"
                            >
                                <a
                                    className={`ui-py-4 ui-text-[20px] ui-tracking-widest ui-transition-colors ui-duration-300 ${pathName === item.href
                                            ? "ui-text-orange-400"
                                            : "ui-text-[#DFD3CE] hover:ui-text-orange-400"
                                        }`}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </a>
                            </motion.div>
                        ))}

                        <motion.div
                            custom={Links.length}
                            variants={menuItemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <hr className="ui-my-2 ui-brightness-50" />
                            <a
                                className="ui-flex ui-items-center ui-justify-start ui-py-4 ui-text-[20px] ui-tracking-widest ui-text-[#DFD3CE] ui-transition-colors ui-duration-300 hover:ui-text-orange-400"
                                href=""
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="ui-flex ui-items-center ui-gap-1 ui-whitespace-nowrap">
                                    <span>BAG -</span>
                                    <span className="ui-inline-block">[ {inbag} ]</span>
                                </span>
                            </a>
                        </motion.div>
                        <motion.div
                            custom={Links.length + 1}
                            variants={menuItemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <a
                                className="ui-flex ui-items-center ui-bg-gradient-to-b ui-from-[#F07E2E] ui-to-[#F56D32] ui-bg-clip-text ui-py-4 ui-text-2xl ui-font-bold ui-tracking-[10px] ui-text-transparent ui-transition-opacity ui-duration-300 hover:ui-opacity-80"
                                href=""
                                onClick={() => setIsMenuOpen(false)}
                            >
                                LOGIN
                            </a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
