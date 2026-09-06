import React, { useEffect, useState, useRef } from "react";

export default function MythicCursor() {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const mousePos = useRef({ x: -100, y: -100 });
    const ringPos = useRef({ x: -100, y: -100 });
    const rafId = useRef(null);

    useEffect(() => {
        if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
            setIsTouchDevice(true);
            return;
        }

        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            if (hidden) setHidden(false);

            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);
        const handleMouseLeave = () => setHidden(true);
        const handleMouseEnter = () => setHidden(false);

        const handleMouseOver = (e) => {
            const target = e.target;
            if (
                target.tagName === "BUTTON" ||
                target.tagName === "A" ||
                target.tagName === "INPUT" ||
                target.closest("button") ||
                target.closest("a") ||
                target.closest(".rk-realm") ||
                target.closest(".rk-accordion-item") ||
                target.closest(".rk-lore-card") ||
                target.getAttribute("role") === "button"
            ) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);
        window.addEventListener("mouseover", handleMouseOver, { passive: true });

        const render = () => {
            const lerpFactor = 0.16;
            ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
            ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

            if (ringRef.current) {
                ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
            }

            rafId.current = requestAnimationFrame(render);
        };

        rafId.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
            window.removeEventListener("mouseover", handleMouseOver);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [hidden]);

    if (isTouchDevice) return null;

    return (
        <>
            {/* Outer Mythic Aegis Ring */}
            <div
                ref={ringRef}
                className={`rk-cursor-ring ${isHovered ? "rk-hover" : ""} ${isClicked ? "rk-click" : ""
                    } ${hidden ? "rk-hidden" : ""}`}
            >
                <svg viewBox="0 0 60 60" className="rk-cursor-svg">
                    <circle cx="30" cy="30" r="26" className="rk-cursor-circle-bg" />
                    <circle cx="30" cy="30" r="26" className="rk-cursor-circle" />
                    <line x1="30" y1="2" x2="30" y2="7" className="rk-cursor-tick" />
                    <line x1="30" y1="53" x2="30" y2="58" className="rk-cursor-tick" />
                    <line x1="2" y1="30" x2="7" y2="30" className="rk-cursor-tick" />
                    <line x1="53" y1="30" x2="58" y2="30" className="rk-cursor-tick" />
                </svg>
                <span className="rk-cursor-rune">᛭</span>
            </div>

            {/* Central Rune Core Pointer */}
            <div
                ref={dotRef}
                className={`rk-cursor-dot ${isHovered ? "rk-hover" : ""} ${isClicked ? "rk-click" : ""
                    } ${hidden ? "rk-hidden" : ""}`}
            >
                <div className="rk-cursor-core" />
            </div>
        </>
    );
}
