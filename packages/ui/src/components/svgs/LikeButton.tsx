import * as React from "react";
const LikeButton = (props) => (
  <svg
    width={19}
    height={17}
    viewBox="0 0 19 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M17.6667 5.88519C17.6667 7.17392 17.1718 8.41175 16.2882 9.32742C14.2541 11.4358 12.2812 13.6344 10.1711 15.6664C9.68742 16.1254 8.92017 16.1087 8.45734 15.6289L2.37813 9.32742C0.540623 7.42267 0.540623 4.34769 2.37813 2.44298C4.2337 0.519541 7.25662 0.519541 9.11217 2.44298L9.33317 2.67202L9.554 2.44311C10.4437 1.52042 11.6553 1 12.9211 1C14.1868 1 15.3984 1.52037 16.2882 2.44298C17.1719 3.35871 17.6667 4.59648 17.6667 5.88519Z"
      fill={props.fillColor}
      stroke="black"
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </svg>
);
export default LikeButton;
