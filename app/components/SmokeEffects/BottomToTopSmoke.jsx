"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomToTopSmoke() {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const createParticles = () => {
            return Array.from({ length: 15 }, (_, i) => ({
                id: `${i}-${Date.now()}`,  // Unique ID using timestamp
                x: Math.random() * 100,    // Random X position (0-100%)
                size: Math.random() * 40 + 20,  // Random size between 20-60px
                opacity: Math.random() * 0.4 + 0.3,  // Opacity between 0.3-0.7
                duration: Math.random() * 8 + 5,  // Longer duration (5-13s) for slower rise
            }));
        };

        setParticles(createParticles());

        const interval = setInterval(() => {
            // Add new particles without removing old ones
            setParticles(prev => [...prev, ...createParticles()]);
        }, 2000); // Add new particles every 2 seconds

        // Clean up old particles periodically
        const cleanupInterval = setInterval(() => {
            setParticles(prev => {
                const now = Date.now();
                return prev.filter(p => {
                    const [id, timestamp] = p.id.split('-');
                    // Keep particles that are less than 10 seconds old
                    return now - parseInt(timestamp) < 10000;
                });
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(cleanupInterval);
        };
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{
                            opacity: 0,
                            bottom: "0%", // Start at the bottom of container
                            scale: 0.5
                        }}
                        animate={{
                            opacity: particle.opacity,
                            bottom: "100%", // Move to the top of container
                            scale: 1
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.8
                        }}
                        transition={{
                            duration: particle.duration,
                            ease: "easeOut"
                        }}
                        style={{
                            position: "absolute",
                            left: `${particle.x}%`,
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: "white",
                            borderRadius: "50%",
                            filter: "blur(15px)",
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}