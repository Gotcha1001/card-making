"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Bright white colors
const smokeColors = [
    "rgba(255, 255, 255, 0.85)",
    "rgba(255, 255, 255, 0.8)",
    "rgba(255, 255, 255, 0.75)",
    "rgba(254, 254, 254, 0.9)",
    "rgba(253, 253, 253, 0.95)",
];

// Purple fade colors
const purpleColors = [
    "rgba(31, 4, 58, 0.85)",
    "rgb(34, 4, 66)",
    "rgba(12, 1, 22, 0.75)",
    "rgba(110, 38, 187, 0.9)",
    "rgba(27, 24, 191, 0.95)",
];

// Seeded random number generator
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function SmokeEffect({ isVisible }) {
    const [showSmoke, setShowSmoke] = useState(isVisible);
    const [smokeParticles, setSmokeParticles] = useState([]);
    const [smallParticles, setSmallParticles] = useState([]);

    useEffect(() => {
        if (isVisible) {
            setShowSmoke(true);
            const timer = setTimeout(() => setShowSmoke(false), 7000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    useEffect(() => {
        // Generate consistent particles
        const generateParticles = (count, isSmall = false) => {
            return Array(count).fill(0).map((_, i) => {
                const seed = i + (isSmall ? 1000 : 0);
                const size = isSmall
                    ? seededRandom(seed) * 50 + 20
                    : seededRandom(seed) * 120 + 60;
                const startX = seededRandom(seed + 1) * 100;
                const startY = seededRandom(seed + 2) * 100;
                const whiteColor = smokeColors[Math.floor(seededRandom(seed + 3) * smokeColors.length)];
                const purpleColor = purpleColors[Math.floor(seededRandom(seed + 4) * purpleColors.length)];
                const duration = isSmall
                    ? 2.5 + seededRandom(seed + 5) * 1.5
                    : 3.5 + seededRandom(seed + 5) * 2;

                const mid1X = (seededRandom(seed + 6) - 0.5) * (isSmall ? 60 : 100);
                const mid1Y = (seededRandom(seed + 7) - 0.5) * (isSmall ? 60 : 100) - (isSmall ? 30 : 50);
                const mid2X = mid1X + (seededRandom(seed + 8) - 0.5) * (isSmall ? 40 : 80);
                const mid2Y = mid1Y + (seededRandom(seed + 9) - 0.5) * (isSmall ? 40 : 80) - (isSmall ? 30 : 50);
                const endX = mid2X + (seededRandom(seed + 10) - 0.5) * (isSmall ? 40 : 60);
                const endY = mid2Y + (seededRandom(seed + 11) - 0.5) * (isSmall ? 40 : 60) - (isSmall ? 30 : 50);

                return {
                    id: `${isSmall ? 'small' : 'smoke'}-${i}`,
                    size,
                    startX,
                    startY,
                    whiteColor,
                    purpleColor,
                    duration,
                    mid1X,
                    mid1Y,
                    mid2X,
                    mid2Y,
                    endX,
                    endY,
                };
            });
        };

        if (showSmoke) {
            setSmokeParticles(generateParticles(30));
            setSmallParticles(generateParticles(20, true));
        }
    }, [showSmoke]);

    if (!showSmoke) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute w-full h-full">
                {smokeParticles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            filter: `blur(${particle.size / 3}px) brightness(1.5)`,
                            left: `${particle.startX}%`,
                            top: `${particle.startY}%`,
                            mixBlendMode: "lighten",
                            pointerEvents: "none",
                        }}
                        initial={{
                            scale: 0.3,
                            opacity: 0,
                            backgroundColor: particle.whiteColor,
                            boxShadow: "0 0 20px 5px rgba(255, 255, 255, 0.5)",
                            x: 0,
                            y: 0,
                        }}
                        animate={{
                            scale: [0.3, 0.7, 1.1, 1.3],
                            opacity: [0, 0.8, 0.6, 0],
                            x: [0, particle.mid1X, particle.mid2X, particle.endX],
                            y: [0, particle.mid1Y, particle.mid2Y, particle.endY],
                        }}
                        transition={{
                            duration: particle.duration,
                            ease: "easeInOut",
                            times: [0, 0.3, 0.7, 1],
                            delay: 0,
                        }}
                    >
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            initial={{
                                backgroundColor: particle.whiteColor,
                                boxShadow: "0 0 20px 5px rgba(255, 255, 255, 0.5)",
                            }}
                            animate={{
                                backgroundColor: particle.purpleColor,
                                boxShadow: "0 0 20px 5px rgba(160, 100, 220, 0.5)",
                            }}
                            transition={{
                                duration: 1,
                                delay: 0,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.div>
                ))}

                {smallParticles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            filter: `blur(${particle.size / 4}px) brightness(1.6)`,
                            left: `${particle.startX}%`,
                            top: `${particle.startY}%`,
                            mixBlendMode: "lighten",
                            pointerEvents: "none",
                        }}
                        initial={{
                            scale: 0.2,
                            opacity: 0,
                            backgroundColor: particle.whiteColor,
                            boxShadow: "0 0 15px 5px rgba(255, 255, 255, 0.6)",
                            x: 0,
                            y: 0,
                        }}
                        animate={{
                            scale: [0.2, 0.5, 0.8, 1],
                            opacity: [0, 0.7, 0.5, 0],
                            x: [0, particle.mid1X, particle.endX],
                            y: [0, particle.mid1Y, particle.endY],
                        }}
                        transition={{
                            duration: particle.duration,
                            ease: "easeInOut",
                            times: [0, 0.3, 0.7, 1],
                            delay: 0,
                        }}
                    >
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            initial={{
                                backgroundColor: particle.whiteColor,
                                boxShadow: "0 0 15px 5px rgba(255, 255, 255, 0.6)",
                            }}
                            animate={{
                                backgroundColor: particle.purpleColor,
                                boxShadow: "0 0 15px 5px rgba(160, 100, 220, 0.6)",
                            }}
                            transition={{
                                duration: 0.9,
                                delay: 0,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default SmokeEffect;