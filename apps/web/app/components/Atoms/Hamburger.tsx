import React from "react";

interface HamburgerMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  setIsOpen,
}) => {
  return (
    <button
      className="ui-flex ui-w-auto ui-flex-col ui-items-center ui-justify-center ui-gap-2"
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Toggle menu"
    >
      <span
        className={`ui-h-[2px] ui-w-20 ui-rounded-lg ui-bg-white/40 ui-transition-all ui-duration-300 ${isOpen ? "ui-translate-y-2 ui-rotate-45 ui-scale-75" : ""}`}
      ></span>

      <span
        className={`ui-h-[2px] ui-w-20 ui-rounded-lg ui-bg-white/40 ui-transition-all ui-duration-300 ${isOpen ? "ui-opacity-0" : ""}`}
      ></span>

      <span
        className={`ui-h-[2px] ui-w-20 ui-rounded-lg ui-bg-white/40 ui-transition-all ui-duration-300 ${isOpen ? "ui--translate-y-3 ui--rotate-45 ui-scale-75" : ""}`}
      ></span>
    </button>
  );
};
