import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Bright white colors for the smoke effect
const smokeColors = [
    "rgba(255, 255, 255, 0.85)",
    "rgba(255, 255, 255, 0.8)",
    "rgba(255, 255, 255, 0.75)",
    "rgba(254, 254, 254, 0.9)",
    "rgba(253, 253, 253, 0.95)",
];

// Purple fade colors for the smoke effect
const purpleColors = [
    "rgba(31, 4, 58, 0.85)",
    "rgb(34, 4, 66)",
    "rgba(12, 1, 22, 0.75)",
    "rgba(110, 38, 187, 0.9)",
    "rgba(27, 24, 191, 0.95)",
];

// Function to generate particle data for the smoke effect
const generateParticles = (count, isSmall = false) => {
    return [...Array(count)].map((_, i) => {
        const size = isSmall ? 20 + (i % 5) * 10 : 60 + (i % 12) * 10;
        const startX = (i * 7) % 100;
        const startY = (i * 11) % 100;
        const whiteColor = smokeColors[i % smokeColors.length];
        const purpleColor = purpleColors[i % purpleColors.length];
        const duration = isSmall ? 2.5 + (i % 3) * 0.5 : 3.5 + (i % 4) * 0.5;

        const mid1X = ((i * 17) % 100) - 50;
        const mid1Y = ((i * 13) % 100) - 50;
        const mid2X = mid1X + ((i * 7) % 80) - 40;
        const mid2Y = mid1Y + ((i * 11) % 80) - 40;
        const endX = mid2X + ((i * 5) % 60) - 30;
        const endY = mid2Y + ((i * 9) % 60) - 30;

        if (isSmall) {
            return {
                id: `small-${i}`,
                size,
                startX,
                startY,
                whiteColor,
                purpleColor,
                duration,
                midX: ((i * 17) % 60) - 30,
                midY: ((i * 13) % 60) - 30,
                endX: ((i * 7) % 40) - 20,
                endY: ((i * 11) % 40) - 20,
                delay: (i % 6) * 0.05,
            };
        }

        return {
            id: `smoke-${i}`,
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
            delay: (i % 10) * 0.05,
        };
    });
};

const SmokeEffectIndividual = ({ isVisible }) => {
    const [showSmoke, setShowSmoke] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Handle client-side rendering
    useEffect(() => {
        setIsClient(true);
        if (isVisible) {
            setShowSmoke(true);
            const timer = setTimeout(() => setShowSmoke(false), 7000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    if (!isClient || !showSmoke) return null;

    // Generate particles only on the client side
    const largeParticles = generateParticles(30);
    const smallParticles = generateParticles(20, true);

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="relative w-full h-full">
                {largeParticles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        style={{
                            position: "absolute",
                            borderRadius: "9999px",
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
                            delay: particle.delay,
                        }}
                    >
                        <motion.div
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "9999px",
                            }}
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
                                delay: particle.delay,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.div>
                ))}
                {/* Smaller detailed particles for subtle depth */}
                {smallParticles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        style={{
                            width: particle.size,
                            height: particle.size,
                            filter: `blur(${particle.size / 4}px) brightness(1.6)`,
                            left: `${particle.startX}%`,
                            top: `${particle.startY}%`,
                            mixBlendMode: "lighten",
                            pointerEvents: "none",
                            position: "absolute",
                            borderRadius: "9999px",
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
                            x: [0, particle.midX, particle.endX],
                            y: [0, particle.midY, particle.endY],
                        }}
                        transition={{
                            duration: particle.duration,
                            ease: "easeInOut",
                            times: [0, 0.3, 0.7, 1],
                            delay: particle.delay,
                        }}
                    >
                        <motion.div
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "9999px",
                            }}
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
                                delay: particle.delay,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SmokeEffectIndividual;
