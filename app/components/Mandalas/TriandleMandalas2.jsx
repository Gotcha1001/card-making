"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Purple fade colors
const purpleColors = [
    "rgba(31, 4, 58, 0.85)",
    "rgb(34, 4, 66)",
    "rgba(12, 1, 22, 0.75)",
    "rgba(110, 38, 187, 0.9)",
    "rgba(27, 24, 191, 0.95)",
    "rgba(76, 0, 153, 0.8)",
    "rgba(147, 51, 234, 0.75)",
];

// Blue colors for mandalas
const blueColors = [
    "rgba(25, 25, 112, 0.85)", // Midnight blue
    "rgba(65, 105, 225, 0.9)", // Royal blue
    "rgba(0, 0, 255, 0.8)", // Blue
    "rgba(30, 144, 255, 0.85)", // Dodger blue
    "rgba(0, 191, 255, 0.8)", // Deep sky blue
    "rgba(0, 71, 171, 0.75)", // Cobalt blue
    "rgba(135, 206, 250, 0.7)", // Light sky blue
];

// Additional color palettes for more variety
const goldColors = [
    "rgba(218, 165, 32, 0.8)", // Golden rod
    "rgba(255, 215, 0, 0.85)", // Gold
    "rgba(184, 134, 11, 0.75)", // Dark goldenrod
    "rgba(255, 223, 0, 0.7)", // Bright gold
];

const TriangleMandalas2 = () => {
    const [mandalaShapes, setMandalaShapes] = useState([]);

    useEffect(() => {
        // Generate initial mandala shapes
        generateMandalaShapes(2); // Start with 2 mandala shapes

        // Set up interval for continuous generation
        const mandalaInterval = setInterval(() => {
            generateMandalaShapes(Math.random() > 0.7 ? 2 : 1); // Occasionally generate 2 at once
        }, 3500 + Math.random() * 1500); // Variable timing between 3.5-5 seconds

        // Clean up on unmount
        return () => clearInterval(mandalaInterval);
    }, []);

    // Function to check if two mandalas overlap
    const checkOverlap = (mandala1, mandala2) => {
        if (
            !mandala1.centerX ||
            !mandala1.centerY ||
            !mandala1.size ||
            !mandala2.centerX ||
            !mandala2.centerY ||
            !mandala2.size
        ) {
            return false;
        }

        // Convert percentage positions to a standard scale for calculation
        const x1 = mandala1.centerX;
        const y1 = mandala1.centerY;
        const x2 = mandala2.centerX;
        const y2 = mandala2.centerY;

        // Calculate the distance between centers
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate the minimum distance needed to prevent overlap
        // Using percentage values, we need to scale appropriately
        // Adding a small buffer (1.2) to ensure there's some space between mandalas
        const minDistance = (((mandala1.size + mandala2.size) / 2) * 1.2) / 100;

        return distance < minDistance;
    };

    // Function to find a non-overlapping position for a new mandala
    const findNonOverlappingPosition = (existingMandalas, newMandala, maxAttempts = 50) => {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Generate a random position
            const centerX = Math.random() * 80 + 10; // Keep away from extreme edges
            const centerY = Math.random() * 80 + 10;

            newMandala.centerX = centerX;
            newMandala.centerY = centerY;

            // Check if this position overlaps with any existing mandala
            let overlaps = false;
            for (const existingMandala of existingMandalas) {
                if (checkOverlap(newMandala, existingMandala)) {
                    overlaps = true;
                    break;
                }
            }

            // If no overlap, return this position
            if (!overlaps) {
                return { centerX, centerY };
            }
        }

        // If we couldn't find a non-overlapping position after maxAttempts,
        // return null or a default position
        return null;
    };

    // Function to generate mandala shapes with triangles
    const generateMandalaShapes = (count) => {
        // First clean up expired mandalas
        const currentMandalaShapes = mandalaShapes.filter(
            (m) => m.expiry > Date.now()
        );

        const newMandalas = [];

        for (let i = 0; i < count; i++) {
            // More variation in size
            const size = Math.random() * 180 + 70;

            // Create a partial mandala with just the size for position finding
            const partialMandala = { size };

            // Find a non-overlapping position
            const position = findNonOverlappingPosition(
                [...currentMandalaShapes, ...newMandalas],
                partialMandala
            );

            // If we couldn't find a non-overlapping position, skip this mandala
            if (!position) continue;

            const { centerX, centerY } = position;

            // More variation in duration
            const duration = 6 + Math.random() * 6;

            // More variation in elements per ring
            const elements = Math.floor(Math.random() * 6) + 5; // 5-10 elements

            // More variation in rings (layers)
            const rings = Math.floor(Math.random() * 4) + 3; // 3-6 rings

            // Color selection with more variety
            let colorPalette = Math.random();
            let color1, color2, extraColors;

            if (colorPalette < 0.5) {
                // Purple and blue theme
                color1 = purpleColors[Math.floor(Math.random() * purpleColors.length)];
                color2 = blueColors[Math.floor(Math.random() * blueColors.length)];
                extraColors = [
                    purpleColors[Math.floor(Math.random() * purpleColors.length)],
                    blueColors[Math.floor(Math.random() * blueColors.length)],
                ];
            } else if (colorPalette < 0.8) {
                // Blue and gold theme
                color1 = blueColors[Math.floor(Math.random() * blueColors.length)];
                color2 = goldColors[Math.floor(Math.random() * goldColors.length)];
                extraColors = [
                    blueColors[Math.floor(Math.random() * blueColors.length)],
                    goldColors[Math.floor(Math.random() * goldColors.length)],
                ];
            } else {
                // Purple and gold theme
                color1 = purpleColors[Math.floor(Math.random() * purpleColors.length)];
                color2 = goldColors[Math.floor(Math.random() * goldColors.length)];
                extraColors = [
                    purpleColors[Math.floor(Math.random() * purpleColors.length)],
                    goldColors[Math.floor(Math.random() * goldColors.length)],
                ];
            }

            // Rotation speed with more variety
            const rotationSpeed =
                (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 1.5);

            // Create an array of triangle types for this mandala
            const availableTypes = [
                "standard",
                "elongated",
                "equilateral",
                "inverted",
            ];
            const triangleTypes = [];

            // Pick 2-3 random triangle types
            const numTypes = Math.floor(Math.random() * 2) + 2;
            for (let j = 0; j < numTypes; j++) {
                const randomIndex = Math.floor(Math.random() * availableTypes.length);
                triangleTypes.push(availableTypes[randomIndex]);
                availableTypes.splice(randomIndex, 1);
            }

            newMandalas.push({
                id: `mandala-${Date.now()}-${i}`,
                centerX,
                centerY,
                size,
                duration,
                elements,
                rings,
                color1,
                color2,
                extraColors,
                rotationSpeed,
                delay: Math.random() * 0.8,
                expiry: Date.now() + duration * 1000 + 800, // Duration + buffer
                layerVariation: Math.random() > 0.3, // 70% chance of having varied layers
                triangleTypes,
                zIndex: Math.floor(Math.random() * 3), // Provides some depth by layering
            });
        }

        setMandalaShapes((current) => [
            ...current.filter((m) => m.expiry > Date.now()),
            ...newMandalas,
        ]);
    };

    // Function to generate triangle points based on type
    const getTrianglePoints = (type) => {
        switch (type) {
            case "standard":
                return "0,-40 -35,20 35,20";
            case "elongated":
                return "0,-50 -25,25 25,25";
            case "equilateral":
                return "0,-35 -30,15 30,15";
            case "inverted":
                return "0,40 -35,-20 35,-20";
            default:
                return "0,-40 -35,20 35,20";
        }
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <AnimatePresence>
                {mandalaShapes.map((mandala) => (
                    <motion.div
                        key={mandala.id}
                        {...{ className: "absolute" }}
                        style={{
                            left: `${mandala.centerX}%`,
                            top: `${mandala.centerY}%`,
                            width: 0,
                            height: 0,
                            transformOrigin: "center",
                            pointerEvents: "none",
                            zIndex: mandala.zIndex,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 1.2,
                            ease: "easeInOut",
                        }}
                    >
                        {/* Render triangle rings */}
                        {Array.from({ length: mandala.rings }).map((_, ringIndex) => {
                            // Calculate ring size with more variation between rings if layerVariation is true
                            const ringRatio = mandala.layerVariation
                                ? 0.6 + (ringIndex / mandala.rings) * 0.8 // Non-linear progression
                                : (ringIndex + 1) / mandala.rings; // Linear progression

                            const ringSize = mandala.size * ringRatio;

                            // Stagger delay from center outward with more variation
                            const ringDelay =
                                mandala.delay +
                                (ringIndex / mandala.rings) *
                                (mandala.layerVariation ? 1.2 : 0.8);

                            // Determine rotation direction and speed, alternating per ring if desired
                            const ringRotation =
                                mandala.layerVariation && ringIndex % 2 === 1
                                    ? -360 * mandala.rotationSpeed
                                    : 360 * mandala.rotationSpeed;

                            // Variable elements per ring
                            const ringElements = mandala.layerVariation
                                ? mandala.elements + ((ringIndex % 3) - 1) // Vary by -1, 0, or +1
                                : mandala.elements;

                            return (
                                <motion.div
                                    key={`ring-${ringIndex}`}
                                    {...{ className: "absolute" }}
                                    style={{
                                        left: 0,
                                        top: 0,
                                        width: 0,
                                        height: 0,
                                        transformOrigin: "center",
                                    }}
                                    initial={{
                                        scale: 0,
                                        rotate: 0,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        scale: 1,
                                        rotate: ringRotation,
                                        opacity: [
                                            0,
                                            0.8,
                                            mandala.layerVariation ? 0.5 + ringIndex * 0.1 : 0.6,
                                        ],
                                    }}
                                    transition={{
                                        duration: mandala.duration,
                                        ease: "easeInOut",
                                        delay: ringDelay,
                                        times: [0, 0.3, 1],
                                    }}
                                >
                                    {/* Render triangles in the ring */}
                                    {Array.from({ length: ringElements }).map(
                                        (_, elementIndex) => {
                                            const angle = (Math.PI * 2 * elementIndex) / ringElements;

                                            // Vary triangle size within the ring
                                            const triangleSizeBase = ringSize / 2;
                                            const triangleSize = mandala.layerVariation
                                                ? triangleSizeBase *
                                                (0.8 + Math.sin(elementIndex * 0.5) * 0.2)
                                                : triangleSizeBase;

                                            const distance = ringSize / 2;
                                            const x = distance * Math.cos(angle);
                                            const y = distance * Math.sin(angle);

                                            // Select color from the expanded palette
                                            let triangleColor;
                                            if (mandala.layerVariation) {
                                                // More complex color pattern
                                                const colorIndex = (ringIndex + elementIndex) % 4;
                                                if (colorIndex === 0) triangleColor = mandala.color1;
                                                else if (colorIndex === 1)
                                                    triangleColor = mandala.color2;
                                                else if (colorIndex === 2 && mandala.extraColors)
                                                    triangleColor = mandala.extraColors[0];
                                                else if (mandala.extraColors)
                                                    triangleColor = mandala.extraColors[1];
                                                else triangleColor = mandala.color1;
                                            } else {
                                                // Simple alternating pattern
                                                triangleColor =
                                                    elementIndex % 2 === 0
                                                        ? mandala.color1
                                                        : mandala.color2;
                                            }

                                            // Select triangle type based on mandala's triangleTypes
                                            const typeIndex =
                                                (ringIndex + elementIndex) %
                                                mandala.triangleTypes.length;
                                            const triangleType = mandala.triangleTypes[typeIndex];
                                            const points = getTrianglePoints(triangleType);

                                            return (
                                                <motion.div
                                                    key={`triangle-${ringIndex}-${elementIndex}`}
                                                    {...{ className: "absolute" }}
                                                    style={{
                                                        left: 0,
                                                        top: 0,
                                                        width: 0,
                                                        height: 0,
                                                        transformOrigin: "center",
                                                    }}
                                                    initial={{
                                                        x: 0,
                                                        y: 0,
                                                        scale: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        x: x,
                                                        y: y,
                                                        scale: 1,
                                                        opacity: mandala.layerVariation
                                                            ? 0.7 + (ringIndex * 0.3) / mandala.rings
                                                            : 1,
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay:
                                                            ringDelay + (elementIndex / ringElements) * 0.3,
                                                        ease: "easeOut",
                                                    }}
                                                >
                                                    <motion.svg
                                                        width={triangleSize}
                                                        height={triangleSize}
                                                        viewBox="-50 -50 100 100"
                                                        style={{
                                                            position: "absolute",
                                                            left: -triangleSize / 2,
                                                            top: -triangleSize / 2,
                                                            transform: `rotate(${angle + Math.PI / 2}rad)`,
                                                        }}
                                                    >
                                                        <motion.polygon
                                                            points={points}
                                                            fill={triangleColor}
                                                            stroke={
                                                                triangleColor === mandala.color1
                                                                    ? mandala.color2
                                                                    : mandala.color1
                                                            }
                                                            strokeWidth={
                                                                mandala.layerVariation ? (ringIndex % 3) + 1 : 1
                                                            }
                                                            initial={{ opacity: 0 }}
                                                            animate={{
                                                                opacity: 1,
                                                                filter:
                                                                    mandala.layerVariation &&
                                                                        ringIndex === mandala.rings - 1
                                                                        ? "drop-shadow(0 0 2px rgba(255,255,255,0.3))"
                                                                        : "none",
                                                            }}
                                                            transition={{ duration: 0.5 }}
                                                        />
                                                    </motion.svg>
                                                </motion.div>
                                            );
                                        }
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default TriangleMandalas2;