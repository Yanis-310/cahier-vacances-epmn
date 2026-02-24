"use client";

import { useEffect, useRef, useState } from "react";

export default function SwimmingFish() {
    const [style, setStyle] = useState<React.CSSProperties>({
        left: "10%",
        top: "200px",
        transform: "scaleX(1)",
    });
    const prevX = useRef(10);

    useEffect(() => {
        function swim() {
            const newX = Math.random() * 80 + 5;
            const newY = Math.random() * 2000 + 100; // px within the page height
            const flip = newX < prevX.current ? "scaleX(-1)" : "scaleX(1)";
            prevX.current = newX;

            setStyle({
                left: `${newX}%`,
                top: `${newY}px`,
                transform: `${flip} rotate(${(Math.random() - 0.5) * 10}deg)`,
            });
        }

        // Initial swim
        swim();
        const interval = setInterval(swim, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <img
            src="/icons/solar/poissons2 11.png"
            alt=""
            className="absolute pointer-events-none z-[15]"
            style={{
                ...style,
                width: "55px",
                height: "55px",
                objectFit: "contain",
                opacity: 0.8,
                transition: "left 10s cubic-bezier(0.45, 0.05, 0.55, 0.95), top 10s cubic-bezier(0.45, 0.05, 0.55, 0.95), transform 2s ease-in-out",
            }}
        />
    );
}
