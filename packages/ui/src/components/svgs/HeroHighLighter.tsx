import * as React from "react";

const HeroHighLighter: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
    return (
        <svg
            viewBox="0 0 618 59"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            {...props}
        >
            <path
                d="M63.5182 24.2022C109.185 24.2022 154.815 21.4078 200.494 21.0569C311.89 20.2011 423.3 21.1493 534.699 20.8719C552.381 20.8278 570.152 20.9959 587.799 19.6384C590.911 19.399 594.025 19.1162 597.112 18.6517C598.27 18.4773 600.053 18.8084 600.504 17.7266C600.866 16.8557 598.672 17.1752 597.728 17.1715C593.408 17.1546 589.088 17.3825 584.777 17.6649C546.496 20.173 508.371 24.4468 470.065 26.7925C382.839 32.1338 295.418 31.652 208.203 36.6601C170.058 38.8505 132.418 43.6481 94.6629 49.2414C76.1463 51.9846 73.1359 52.483 56.7958 54.7919C54.1042 55.1723 51.4042 55.4938 48.7167 55.9021C48.1545 55.9874 46.7104 55.8172 47.0515 56.2721C47.4593 56.8158 48.4084 56.4387 49.0867 56.3954C55.4381 55.99 60.3828 55.0167 66.8485 53.6818C101.748 46.4767 136.144 39.5416 171.569 35.0566C273.157 22.1953 375.31 8.29204 477.775 5.76204C499.55 5.22438 521.447 5.94133 543.209 4.83695C548.61 4.56291 552.818 3.87998 557.518 2"
                stroke="url(#paint0_linear_2_87)"
                strokeOpacity={0.1}
                strokeWidth={3}
                strokeLinecap="round"
                className="animated-path"
            />
            <path
                d="M48.2991 19.027C217.488 19.027 386.677 19.027 555.867 19.027C575.109 19.027 594.35 19.027 613.592 19.027C614.456 19.027 617.039 18.9139 616.183 19.027C609.189 19.9507 602.122 20.1929 595.091 20.7538C556.963 23.7954 518.935 25.6598 480.687 26.6128C391.055 28.846 301.46 30.514 211.855 33.8902C164.698 35.667 117.562 37.5937 70.378 38.5156C49.6089 38.9214 28.7223 38.5573 7.96508 39.6257C6.15095 39.7191 4.3281 39.8111 2.53787 40.1191C1.6024 40.2801 4.30227 40.9779 5.25148 40.9825C22.7068 41.0681 40.4655 38.3334 57.7351 36.4804C140.183 27.634 222.765 19.3673 305.66 16.2517C346.043 14.734 386.443 14.5866 426.847 14.5866"
                stroke="url(#paint1_linear_2_87)"
                strokeOpacity={0.1}
                strokeWidth={3}
                strokeLinecap="round"
                className="animated-path"
            />
            <defs>
                <linearGradient
                    id="paint0_linear_2_87"
                    x1={47}
                    y1={29.2815}
                    x2={600.544}
                    y2={29.2815}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#F07E2E" />
                    <stop offset={1} stopColor="#F56D32" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_2_87"
                    x1={2.34381}
                    y1={27.7855}
                    x2={616.354}
                    y2={27.7855}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#F07E2E" />
                    <stop offset={1} stopColor="#F56D32" />
                </linearGradient>
            </defs>
            <style>{`
        .animated-path {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: draw 3s linear forwards;
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
        </svg>
    );
};

export default HeroHighLighter;
