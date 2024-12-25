import React, { useEffect, useRef } from "react";

const LogoHighLighter: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = `${length}`;
      pathRef.current.style.strokeDashoffset = `${length}`;
    }
  }, []);

  return (
    <svg
      width={110}
      height={8}
      viewBox="0 0 110 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        ref={pathRef}
        d="M9.31953 6.42974C38.2333 6.42974 124.929 4.42519 96.0218 3.82916C79.3674 3.48577 62.6788 3.78009 46.022 3.78009C36.7973 3.78009 27.5727 3.78009 18.348 3.78009C15.1422 3.78009 11.9365 3.79074 8.73072 3.78009C6.47268 3.77259 0.76264 5.49865 1.95941 3.58382C3.44105 1.2132 24.7337 2.8993 26.0025 2.89687C52.1553 2.84687 78.3086 2.89687 104.461 2.89687C115.518 2.89687 98.8237 3.31927 98.328 3.33848C89.5613 3.67828 80.7999 3.78009 72.0278 3.78009"
        stroke="url(#paint0_linear_6_1558)"
        strokeOpacity={0.1}
        strokeWidth={3}
        strokeLinecap="round"
        className="animated-path"
      />
      <defs>
        <linearGradient
          id="paint0_linear_6_1558"
          x1={1.79639}
          y1={4.37374}
          x2={108.237}
          y2={4.37374}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F07E2E" />
          <stop offset={1} stopColor="#F56D32" />
        </linearGradient>
      </defs>
      <style>{`
                .animated-path {
                    animation: draw 1.5s ease-in-out forwards ;
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

export default LogoHighLighter;
