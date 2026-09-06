import { useEffect, useRef } from "react";

/**
 * High-performance parallax and cursor handler using Direct DOM manipulation and rAF.
 * Bypasses React state updates to prevent re-renders on mousemove (60-120 FPS boost).
 */
export function usePerformanceParallax(containerRef) {
    useEffect(() => {
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (isTouch || isReducedMotion) return;

        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let rafId = null;

        const cursorDot = document.getElementById("rag-cursor-dot");
        const cursorRing = document.getElementById("rag-cursor-ring");

        const onMouseMove = (e) => {
            const { clientX, clientY } = e;

            // Update custom cursor instantly via transform
            if (cursorDot) {
                cursorDot.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
            }
            if (cursorRing) {
                cursorRing.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
            }

            // Check cursor hover state
            const targetEl = document.elementFromPoint(clientX, clientY);
            if (cursorRing && targetEl) {
                const isHoverable = !!targetEl.closest("[data-cursor-hover], button, a, [tabindex]");
                if (isHoverable) {
                    cursorRing.classList.add("ring-active");
                } else {
                    cursorRing.classList.remove("ring-active");
                }
            }

            // Calculate normalized target (-1 to 1) for parallax
            targetX = (clientX / window.innerWidth - 0.5) * 2;
            targetY = (clientY / window.innerHeight - 0.5) * 2;
        };

        const updateParallax = () => {
            currentX += (targetX - currentX) * 0.07;
            currentY += (targetY - currentY) * 0.07;

            if (containerRef.current) {
                containerRef.current.style.setProperty("--px", currentX.toFixed(4));
                containerRef.current.style.setProperty("--py", currentY.toFixed(4));
            }

            rafId = requestAnimationFrame(updateParallax);
        };

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        rafId = requestAnimationFrame(updateParallax);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [containerRef]);
}
