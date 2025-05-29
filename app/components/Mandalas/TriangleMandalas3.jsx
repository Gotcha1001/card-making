"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Color palettes with improved aesthetics
const colorPalettes = {
    purple: [
        "rgba(31, 4, 58, 0.85)",
        "rgba(64, 9, 119, 0.9)",
        "rgba(110, 38, 187, 0.85)",
        "rgba(89, 12, 141, 0.8)",
        "rgba(130, 80, 190, 0.75)",
    ],
    blue: [
        "rgba(25, 25, 112, 0.85)",
        "rgba(65, 105, 225, 0.8)",
        "rgba(30, 144, 255, 0.75)",
        "rgba(0, 191, 255, 0.7)",
        "rgba(72, 61, 139, 0.85)",
    ],
    teal: [
        "rgba(0, 128, 128, 0.8)",
        "rgba(32, 178, 170, 0.75)",
        "rgba(0, 139, 139, 0.85)",
        "rgba(72, 209, 204, 0.7)",
        "rgba(0, 206, 209, 0.8)",
    ],

    custom: [], // Will be populated if custom colors are provided
};

const TriangleMandalas3 = ({
    maxMandalas = 5,
    generationInterval = 4000,
    colorScheme = "purple",
    customColors,
    minSize = 80,
    maxSize = 200,
    minElements = 6,
    maxElements = 12,
    minRings = 2,
    maxRings = 5,
    minDuration = 7,
    maxDuration = 15,
    enablePulse = true,
}) => {
    const [mandalaShapes, setMandalaShapes] = useState([]);

    // Setup color palette
    const activeColorPalette = useMemo(() => {
        if (colorScheme === "custom" && customColors && customColors.length >= 2) {
            colorPalettes.custom = customColors;
            return colorPalettes.custom;
        }
        return colorPalettes[colorScheme];
    }, [colorScheme, customColors]);

    // Function to get random colors from the active palette
    const getRandomColors = useCallback(() => {
        const colors = activeColorPalette;
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        let color2;

        // Ensure color2 is different from color1
        do {
            color2 = colors[Math.floor(Math.random() * colors.length)];
        } while (color2 === color1 && colors.length > 1);

        return { color1, color2 };
    }, [activeColorPalette]);

    // Function to generate new mandalas
    const generateMandalaShapes = useCallback(() => {
        if (mandalaShapes.length >= maxMandalas) {
            // If at max capacity, only clear expired mandalas
            setMandalaShapes((current) =>
                current.filter((m) => m.expiry > Date.now())
            );
            return;
        }

        const fadeEffects = ["linear", "ease", "back"];
        const newMandalas = Array(1)
            .fill(0)
            .map(() => {
                const centerX = Math.random() * 80 + 10; // Keep away from extreme edges
                const centerY = Math.random() * 80 + 10;
                const size = Math.random() * (maxSize - minSize) + minSize;
                const duration =
                    Math.random() * (maxDuration - minDuration) + minDuration;
                const elements =
                    Math.floor(Math.random() * (maxElements - minElements + 1)) +
                    minElements;
                const rings =
                    Math.floor(Math.random() * (maxRings - minRings + 1)) + minRings;
                const { color1, color2 } = getRandomColors();
                const rotationSpeed =
                    (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 1.5);
                const pulse = enablePulse && Math.random() > 0.5;
                const fadeEffect =
                    fadeEffects[Math.floor(Math.random() * fadeEffects.length)];

                return {
                    id: `mandala-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    centerX,
                    centerY,
                    size,
                    duration,
                    elements,
                    rings,
                    color1,
                    color2,
                    rotationSpeed,
                    delay: Math.random() * 0.8,
                    expiry: Date.now() + duration * 1000 + 1000, // Duration + buffer
                    pulse,
                    fadeEffect,
                };
            });

        setMandalaShapes((current) => {
            const filtered = current.filter((m) => m.expiry > Date.now());
            return [...filtered, ...newMandalas].slice(0, maxMandalas);
        });
    }, [
        mandalaShapes.length,
        maxMandalas,
        minSize,
        maxSize,
        minElements,
        maxElements,
        minRings,
        maxRings,
        minDuration,
        maxDuration,
        getRandomColors,
        enablePulse,
    ]);

    useEffect(() => {
        // Generate initial mandala shapes
        generateMandalaShapes();

        // Set up interval for continuous generation
        const mandalaInterval = setInterval(() => {
            generateMandalaShapes();
        }, generationInterval);

        // Clean up on unmount
        return () => clearInterval(mandalaInterval);
    }, [generateMandalaShapes, generationInterval]);

    // Triangle component for reuse
    const Triangle = useCallback(
        ({
            size,
            color,
            strokeColor,
            angle,
            pulsate = false,
            baseOpacity = 0.8,
        }) => {
            const pulseAnimation = pulsate
                ? {
                    opacity: [baseOpacity, baseOpacity * 0.6, baseOpacity],
                    scale: [1, 1.05, 1],
                }
                : { opacity: baseOpacity };

            return (
                <motion.svg
                    width={size}
                    height={size}
                    viewBox="-50 -50 100 100"
                    style={{
                        position: "absolute",
                        left: -size / 2,
                        top: -size / 2,
                        transform: `rotate(${angle + Math.PI / 2}rad)`,
                    }}
                >
                    <motion.polygon
                        points="0,-40 -35,20 35,20"
                        fill={color}
                        stroke={strokeColor}
                        strokeWidth="1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={pulseAnimation}
                        transition={{
                            duration: pulsate ? 2 : 0.5,
                            repeat: pulsate ? Infinity : 0,
                            repeatType: "reverse",
                        }}
                    />
                </motion.svg>
            );
        },
        []
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <AnimatePresence>
                {mandalaShapes.map((mandala) => {
                    // Map fadeEffect to actual framer-motion easing values
                    const easingType =
                        mandala.fadeEffect === "back"
                            ? [0.68, -0.6, 0.32, 1.6]
                            : mandala.fadeEffect === "ease"
                                ? "easeInOut"
                                : "linear";

                    return (
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
                            transition={{
                                duration: 1,
                                ease: easingType,
                            }}
                        >
                            {/* Render triangle rings */}
                            {Array.from({ length: mandala.rings }).map((_, ringIndex) => {
                                // Calculate ring size from small to large (inside to outside)
                                const ringSize =
                                    (mandala.size / mandala.rings) * (ringIndex + 1);
                                const ringDelay =
                                    mandala.delay + (ringIndex / mandala.rings) * 0.8; // Stagger delay from center outward
                                const ringOpacity = 0.9 - (ringIndex / mandala.rings) * 0.3; // Outer rings slightly more transparent

                                return (
                                    <motion.div
                                        key={`ring-${ringIndex}`}
                                        className="absolute"
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
                                            rotate: 360 * mandala.rotationSpeed,
                                            opacity: [0, ringOpacity, ringOpacity * 0.8],
                                        }}
                                        transition={{
                                            duration: mandala.duration,
                                            ease: "easeInOut",
                                            delay: ringDelay,
                                            times: [0, 0.3, 1],
                                        }}
                                    >
                                        {/* Render triangles in the ring */}
                                        {Array.from({ length: mandala.elements }).map(
                                            (_, elementIndex) => {
                                                const angle =
                                                    (Math.PI * 2 * elementIndex) / mandala.elements;
                                                const triangleSize = ringSize / 2;
                                                const distance = ringSize / 2;
                                                const x = distance * Math.cos(angle);
                                                const y = distance * Math.sin(angle);
                                                const isEven = elementIndex % 2 === 0;
                                                const triangleColor = isEven
                                                    ? mandala.color1
                                                    : mandala.color2;
                                                const strokeColor = isEven
                                                    ? mandala.color2
                                                    : mandala.color1;

                                                // Alternate pulsing on inner/outer rings for interesting effect
                                                const shouldPulse =
                                                    mandala.pulse &&
                                                    ((ringIndex % 2 === 0 && isEven) ||
                                                        (ringIndex % 2 === 1 && !isEven));

                                                return (
                                                    <motion.div
                                                        key={`triangle-${ringIndex}-${elementIndex}`}
                                                        className="absolute"
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
                                                            opacity: 1,
                                                        }}
                                                        transition={{
                                                            duration: 1.5,
                                                            delay:
                                                                ringDelay +
                                                                (elementIndex / mandala.elements) * 0.3,
                                                            ease: "easeOut",
                                                        }}
                                                    >
                                                        <Triangle
                                                            size={triangleSize}
                                                            color={triangleColor}
                                                            strokeColor={strokeColor}
                                                            angle={angle}
                                                            pulsate={shouldPulse}
                                                            baseOpacity={
                                                                0.8 - (ringIndex / mandala.rings) * 0.2
                                                            }
                                                        />
                                                    </motion.div>
                                                );
                                            }
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default TriangleMandalas3;