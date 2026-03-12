"use client";

import { useEffect, useRef } from "react";

interface Node {
    x: number; y: number; vx: number; vy: number; radius: number; opacity: number;
}

const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 160;
const SPEED = 0.6;
const NODE_SIZE = 1.8;

export default function NetworkBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        let nodes: Node[] = [];

        const resize = () => {
            const parent = canvas.parentElement;
            canvas.width = parent ? parent.clientWidth : window.innerWidth;
            canvas.height = parent ? parent.clientHeight : window.innerHeight;
        };

        const initNodes = () => {
            nodes = Array.from({ length: PARTICLE_COUNT }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * SPEED,
                vy: (Math.random() - 0.5) * SPEED,
                radius: Math.random() * (NODE_SIZE * 1.5) + 1,
                opacity: Math.random() * 0.5 + 0.3,
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Move nodes
            nodes.forEach((n) => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
            });

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DISTANCE) {
                        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.25;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(26, 127, 212, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            nodes.forEach((n) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(26, 127, 212, ${n.opacity})`;
                ctx.fill();
                // Outer glow
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(26, 127, 212, ${n.opacity * 0.15})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(draw);
        };

        resize();
        initNodes();
        draw();

        const resizeObserver = new ResizeObserver(() => {
            resize();
            initNodes();
        });
        resizeObserver.observe(canvas.parentElement ?? document.body);

        return () => {
            cancelAnimationFrame(animId);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
            aria-hidden="true"
        />
    );
}
