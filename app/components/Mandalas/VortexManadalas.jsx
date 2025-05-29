"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const purpleColors = [
    "rgba(31, 4, 58, 0.85)",
    "rgb(34, 4, 66)",
    "rgba(12, 1, 22, 0.75)",
    "rgba(110, 38, 187, 0.9)",
    "rgba(27, 24, 191, 0.95)",
];

const blueColors = [
    "rgba(25, 25, 112, 0.85)",
    "rgba(65, 105, 225, 0.9)",
    "rgba(0, 0, 255, 0.8)",
    "rgba(30, 144, 255, 0.85)",
    "rgba(0, 191, 255, 0.8)",
];

const VortexMandalas = () => {
    const [mandalaShapes, setMandalaShapes] = useState([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const generateMandalaShapes = () => {
            const newMandalas = Array(1).fill(0).map((_, i) => {
                const seedRandom = (seed) => {
                    const x = Math.sin(seed) * 10000;
                    return x - Math.floor(x);
                };

                const seed = Date.now();
                const centerX = seedRandom(seed + i) * 80 + 10;
                const centerY = seedRandom(seed + i + 1) * 80 + 10;
                const size = seedRandom(seed + i + 2) * 120 + 80;
                const duration = 7 + seedRandom(seed + i + 3) * 4;
                const elements = Math.floor(seedRandom(seed + i + 4) * 4) + 6;
                const rings = Math.floor(seedRandom(seed + i + 5) * 2) + 3;
                const color1 = purpleColors[Math.floor(seedRandom(seed + i + 6) * purpleColors.length)];
                const color2 = blueColors[Math.floor(seedRandom(seed + i + 7) * blueColors.length)];

                // Varied spinning outcomes
                const spinType = Math.floor(seedRandom(seed + i + 8) * 5);
                let spinningBehavior;

                switch (spinType) {
                    case 0: // Inward spiral
                        spinningBehavior = {
                            type: 'inward-spiral',
                            rotationSpeed: seedRandom(seed + i + 9) > 0.5 ? 1 : -1,
                            spiralIntensity: 1.5 + seedRandom(seed + i + 10) * 2
                        };
                        break;
                    case 1: // Outward explosion
                        spinningBehavior = {
                            type: 'outward-explosion',
                            rotationSpeed: seedRandom(seed + i + 9) > 0.5 ? 1 : -1,
                            explosionIntensity: 2 + seedRandom(seed + i + 10) * 3
                        };
                        break;
                    case 2: // Chaotic spin
                        spinningBehavior = {
                            type: 'chaotic-spin',
                            rotationSpeed: (seedRandom(seed + i + 9) - 0.5) * 4,
                            chaosFactor: 1 + seedRandom(seed + i + 10) * 2
                        };
                        break;
                    case 3: // Pulsing rotation
                        spinningBehavior = {
                            type: 'pulsing-rotation',
                            rotationSpeed: seedRandom(seed + i + 9) > 0.5 ? 1 : -1,
                            pulseIntensity: 1 + seedRandom(seed + i + 10) * 1.5
                        };
                        break;
                    default: // Smooth rotation
                        spinningBehavior = {
                            type: 'smooth-rotation',
                            rotationSpeed: seedRandom(seed + i + 9) > 0.5 ? 1 : -1,
                            smoothness: 0.5 + seedRandom(seed + i + 10)
                        };
                }

                return {
                    id: `mandala-${seed}-${i}`,
                    centerX,
                    centerY,
                    size,
                    duration,
                    elements,
                    rings,
                    color1,
                    color2,
                    spinningBehavior,
                    delay: seedRandom(seed + i + 9) * 0.8,
                    expiry: seed + duration * 1000 + 800,
                };
            });

            setMandalaShapes((current) => [...current, ...newMandalas]);
            setMandalaShapes((current) => current.filter((m) => m.expiry > Date.now()));
        };

        generateMandalaShapes();
        const mandalaInterval = setInterval(generateMandalaShapes, 4000);
        return () => clearInterval(mandalaInterval);
    }, [isClient]);

    if (!isClient) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <AnimatePresence>
                {mandalaShapes.map((mandala) => (
                    <motion.div
                        key={mandala.id}
                        className="absolute"
                        style={{
                            left: `${mandala.centerX}%`,
                            top: `${mandala.centerY}%`,
                            width: 0,
                            height: 0,
                            transformOrigin: "center",
                            pointerEvents: "none",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        {Array.from({ length: mandala.rings }).map((_, ringIndex) => {
                            const ringSize = (mandala.size / mandala.rings) * (ringIndex + 1);
                            const ringDelay = mandala.delay + (ringIndex / mandala.rings) * 0.8;

                            return (
                                <motion.div
                                    key={`ring-${ringIndex}`}
                                    className="absolute"
                                    style={{ left: 0, top: 0, width: 0, height: 0, transformOrigin: "center" }}
                                    initial={{
                                        scale: 0,
                                        rotate: 0,
                                        opacity: 0
                                    }}
                                    animate={{
                                        scale: 1,
                                        rotate: (() => {
                                            switch (mandala.spinningBehavior.type) {
                                                case 'inward-spiral':
                                                    return 360 * mandala.spinningBehavior.rotationSpeed * mandala.spinningBehavior.spiralIntensity;
                                                case 'outward-explosion':
                                                    return 720 * mandala.spinningBehavior.rotationSpeed * mandala.spinningBehavior.explosionIntensity;
                                                case 'chaotic-spin':
                                                    return 540 * mandala.spinningBehavior.rotationSpeed * mandala.spinningBehavior.chaosFactor;
                                                case 'pulsing-rotation':
                                                    return 450 * mandala.spinningBehavior.rotationSpeed * mandala.spinningBehavior.pulseIntensity;
                                                default:
                                                    return 360 * mandala.spinningBehavior.rotationSpeed;
                                            }
                                        })(),
                                        opacity: [0, 0.8, 0.6]
                                    }}
                                    transition={{
                                        duration: mandala.duration,
                                        ease: "easeInOut",
                                        delay: ringDelay,
                                        times: [0, 0.3, 1]
                                    }}
                                >
                                    {Array.from({ length: mandala.elements }).map((_, elementIndex) => {
                                        const angle = (Math.PI * 2 * elementIndex) / mandala.elements;
                                        const elementSize = ringSize / 3;
                                        const distance = ringSize / 2;

                                        // Dynamic positioning based on spin type
                                        let x = distance * Math.cos(angle);
                                        let y = distance * Math.sin(angle);

                                        if (mandala.spinningBehavior.type === 'inward-spiral') {
                                            x *= 1 - (elementIndex / mandala.elements) * 0.5;
                                            y *= 1 - (elementIndex / mandala.elements) * 0.5;
                                        }

                                        if (mandala.spinningBehavior.type === 'outward-explosion') {
                                            x *= 1 + (elementIndex / mandala.elements) * 0.5;
                                            y *= 1 + (elementIndex / mandala.elements) * 0.5;
                                        }

                                        const elementColor = elementIndex % 2 === 0 ? mandala.color1 : mandala.color2;

                                        return (
                                            <motion.div
                                                key={`element-${ringIndex}-${elementIndex}`}
                                                className="absolute"
                                                style={{ left: 0, top: 0, width: 0, height: 0, transformOrigin: "center" }}
                                                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                                                animate={{ x: x, y: y, scale: 1, opacity: 1 }}
                                                transition={{
                                                    duration: 1.5,
                                                    delay: ringDelay + (elementIndex / mandala.elements) * 0.3,
                                                    ease: "easeOut"
                                                }}
                                            >
                                                <motion.svg
                                                    width={elementSize}
                                                    height={elementSize}
                                                    viewBox="-50 -50 100 100"
                                                    style={{
                                                        position: "absolute",
                                                        left: -elementSize / 2,
                                                        top: -elementSize / 2,
                                                        transform: `rotate(${angle}rad)`
                                                    }}
                                                >
                                                    <motion.rect
                                                        x="-25"
                                                        y="-25"
                                                        width="50"
                                                        height="50"
                                                        fill={elementColor}
                                                        stroke={elementColor === mandala.color1 ? mandala.color2 : mandala.color1}
                                                        strokeWidth="2"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                </motion.svg>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default VortexMandalas;