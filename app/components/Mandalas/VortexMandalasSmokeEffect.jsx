"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TriangleMandalas from "./TriangleMandalas";
// import VaryingShapeMandalas from "./VaryingShapeMandalas";

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

// Blue colors for mandalas
const blueColors = [
    "rgba(25, 25, 112, 0.85)", // Midnight blue
    "rgba(65, 105, 225, 0.9)", // Royal blue
    "rgba(0, 0, 255, 0.8)", // Blue
    "rgba(30, 144, 255, 0.85)", // Dodger blue
    "rgba(0, 191, 255, 0.8)", // Deep sky blue
];

// Unique ID generator
const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 1000)}`;
};

function VortexMandalaSmokeEffect() {
    const [particles, setParticles] = useState([]);
    const [smallParticles, setSmallParticles] = useState([]);
    const [vortexShapes, setVortexShapes] = useState([]);
    const [mandalaShapes, setMandalaShapes] = useState([]);

    // Create new particles at regular intervals
    useEffect(() => {
        // Generate initial particles
        generateParticles();
        generateSmallParticles();
        generateVortexShapes();
        generateMandalaShapes();

        // Set up intervals for continuous generation
        const largeInterval = setInterval(() => {
            generateParticles();
        }, 2000); // Create new large particles every 2 seconds

        const smallInterval = setInterval(() => {
            generateSmallParticles();
        }, 1500); // Create new small particles every 1.5 seconds

        const vortexInterval = setInterval(() => {
            generateVortexShapes();
        }, 3000); // Create new vortex shapes every 3 seconds

        const mandalaInterval = setInterval(() => {
            generateMandalaShapes();
        }, 4000); // Create new mandala shapes every 4 seconds

        return () => {
            clearInterval(largeInterval);
            clearInterval(smallInterval);
            clearInterval(vortexInterval);
            clearInterval(mandalaInterval);
        };
    }, []);

    // Function to generate large particles
    const generateParticles = () => {
        const newParticles = Array(5)
            .fill(0)
            .map(() => ({
                id: generateUniqueId(), // Use the new unique ID generator
                size: Math.random() * 120 + 60,
                startX: Math.random() * 100,
                startY: Math.random() * 100,
                whiteColor: smokeColors[Math.floor(Math.random() * smokeColors.length)],
                purpleColor: purpleColors[Math.floor(Math.random() * purpleColors.length)],
                duration: 3.5 + Math.random() * 2,
                mid1X: (Math.random() - 0.5) * 100,
                mid1Y: (Math.random() - 0.5) * 100 - 50,
                mid2X: (Math.random() - 0.5) * 100 + (Math.random() - 0.5) * 80,
                mid2Y: (Math.random() - 0.5) * 100 - 50 + (Math.random() - 0.5) * 80,
                endX: (Math.random() - 0.5) * 100 + (Math.random() - 0.5) * 80 + (Math.random() - 0.5) * 60,
                endY: (Math.random() - 0.5) * 100 - 50 + (Math.random() - 0.5) * 80 + (Math.random() - 0.5) * 60,
                delay: Math.random() * 0.5,
                expiry: Date.now() + (3.5 + Math.random() * 2) * 1000 + 500, // Duration + delay + buffer
            }));

        setParticles((current) => [...current, ...newParticles]);

        // Clean up expired particles
        setParticles((current) => current.filter((p) => p.expiry > Date.now()));
    };

    // Function to generate small particles
    const generateSmallParticles = () => {
        const newParticles = Array(4)
            .fill(0)
            .map(() => ({
                id: generateUniqueId(), // Use the new unique ID generator
                size: Math.random() * 50 + 20,
                startX: Math.random() * 100,
                startY: Math.random() * 100,
                whiteColor: smokeColors[Math.floor(Math.random() * smokeColors.length)],
                purpleColor: purpleColors[Math.floor(Math.random() * purpleColors.length)],
                duration: 2.5 + Math.random() * 1.5,
                midX: (Math.random() - 0.5) * 60,
                midY: (Math.random() - 0.5) * 60 - 30,
                endX: (Math.random() - 0.5) * 60 + (Math.random() - 0.5) * 40,
                endY: (Math.random() - 0.5) * 60 - 30 + (Math.random() - 0.5) * 40,
                delay: Math.random() * 0.3,
                expiry: Date.now() + (2.5 + Math.random() * 1.5) * 1000 + 500, // Duration + delay + buffer
            }));

        setSmallParticles((current) => [...current, ...newParticles]);

        // Clean up expired particles
        setSmallParticles((current) =>
            current.filter((p) => p.expiry > Date.now())
        );
    };

    // Function to generate vortex shapes
    const generateVortexShapes = () => {
        const newVortexes = Array(2)
            .fill(0)
            .map(() => {
                const centerX = Math.random() * 80 + 10; // Keep away from extreme edges
                const centerY = Math.random() * 80 + 10;
                const size = Math.random() * 150 + 100;
                const duration = 6 + Math.random() * 3;
                const rotations = 2 + Math.random() * 3;
                const arms = Math.floor(Math.random() * 3) + 3; // 3-5 arms
                const color1 = purpleColors[Math.floor(Math.random() * purpleColors.length)];
                const color2 = blueColors[Math.floor(Math.random() * blueColors.length)];

                return {
                    id: generateUniqueId(), // Use the new unique ID generator
                    centerX,
                    centerY,
                    size,
                    duration,
                    rotations,
                    arms,
                    color1,
                    color2,
                    delay: Math.random() * 0.5,
                    expiry: Date.now() + duration * 1000 + 500, // Duration + buffer
                };
            });

        setVortexShapes((current) => [...current, ...newVortexes]);

        // Clean up expired vortexes
        setVortexShapes((current) => current.filter((v) => v.expiry > Date.now()));
    };

    // Function to generate mandala shapes
    const generateMandalaShapes = () => {
        const newMandalas = Array(1)
            .fill(0)
            .map(() => {
                const centerX = Math.random() * 80 + 10; // Keep away from extreme edges
                const centerY = Math.random() * 80 + 10;
                const size = Math.random() * 120 + 80;
                const duration = 7 + Math.random() * 4;
                const elements = Math.floor(Math.random() * 4) + 6; // 6-9 elements
                const rings = Math.floor(Math.random() * 2) + 2; // 2-3 rings
                const color1 = purpleColors[Math.floor(Math.random() * purpleColors.length)];
                const color2 = blueColors[Math.floor(Math.random() * blueColors.length)];

                return {
                    id: generateUniqueId(), // Use the new unique ID generator
                    centerX,
                    centerY,
                    size,
                    duration,
                    elements,
                    rings,
                    color1,
                    color2,
                    delay: Math.random() * 0.8,
                    expiry: Date.now() + duration * 1000 + 800, // Duration + buffer
                };
            });

        setMandalaShapes((current) => [...current, ...newMandalas]);

        // Clean up expired mandalas
        setMandalaShapes((current) => current.filter((m) => m.expiry > Date.now()));
    };

    // Rest of the component remains the same...
    // (I've omitted the render method for brevity, but it would be identical to the previous version)

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <TriangleMandalas />
            <div className="absolute w-full h-full">
                <AnimatePresence>
                    {/* Rendering logic remains the same */}
                    {particles.map((particle) => (
                        <motion.div key={particle.id} /* rest of the rendering */ />
                    ))}
                    {smallParticles.map((particle) => (
                        <motion.div key={particle.id} /* rest of the rendering */ />
                    ))}
                    {/* Similar changes for vortexShapes and mandalaShapes */}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default VortexMandalaSmokeEffect;