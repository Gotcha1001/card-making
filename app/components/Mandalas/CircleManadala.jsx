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

const CircleMandalas = () => {
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
                const rotationSpeed = seedRandom(seed + i + 8) > 0.5 ? 1 : -1;

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
                    rotationSpeed,
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
                                    initial={{ scale: 0, rotate: 0, opacity: 0 }}
                                    animate={{ scale: 1, rotate: 360 * mandala.rotationSpeed, opacity: [0, 0.8, 0.6] }}
                                    transition={{ duration: mandala.duration, ease: "easeInOut", delay: ringDelay, times: [0, 0.3, 1] }}
                                >
                                    {Array.from({ length: mandala.elements }).map((_, elementIndex) => {
                                        const angle = (Math.PI * 2 * elementIndex) / mandala.elements;
                                        const circleSize = ringSize / 3;
                                        const distance = ringSize / 2;
                                        const x = distance * Math.cos(angle);
                                        const y = distance * Math.sin(angle);
                                        const circleColor = elementIndex % 2 === 0 ? mandala.color1 : mandala.color2;

                                        return (
                                            <motion.div
                                                key={`circle-${ringIndex}-${elementIndex}`}
                                                className="absolute"
                                                style={{ left: 0, top: 0, width: 0, height: 0, transformOrigin: "center" }}
                                                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                                                animate={{ x: x, y: y, scale: 1, opacity: 1 }}
                                                transition={{ duration: 1.5, delay: ringDelay + (elementIndex / mandala.elements) * 0.3, ease: "easeOut" }}
                                            >
                                                <motion.svg
                                                    width={circleSize}
                                                    height={circleSize}
                                                    viewBox="-50 -50 100 100"
                                                    style={{ position: "absolute", left: -circleSize / 2, top: -circleSize / 2 }}
                                                >
                                                    <motion.circle
                                                        cx="0"
                                                        cy="0"
                                                        r="40"
                                                        fill={circleColor}
                                                        stroke={circleColor === mandala.color1 ? mandala.color2 : mandala.color1}
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

export default CircleMandalas;