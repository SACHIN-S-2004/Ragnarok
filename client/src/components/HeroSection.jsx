import React from "react";
import "./HeroSection.css";

export default function HeroSection({ onExploreRealms, onExploreSagas }) {
    return (
        <section className="hero-section" id="hero">
            <div className="hero-stars" aria-hidden="true" />

            {/* Yggdrasil Silhouette SVG */}
            <div
                className="hero-tree-wrap"
                style={{
                    transform: `translate3d(calc(-50% + calc(var(--px) * 12px)), calc(var(--py) * 8px), 0)`,
                }}
            >
                <svg className="hero-tree-svg" viewBox="0 0 600 700" fill="none">
                    <defs>
                        <radialGradient id="heroTreeGlow" cx="50%" cy="40%" r="50%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#05070a" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>

                    <circle cx="300" cy="350" r="280" fill="url(#heroTreeGlow)" />

                    {/* Root branches */}
                    <path
                        d="M300 700 L300 420 
               M300 420 L180 260 M300 420 L420 260 M300 420 L300 180 
               M180 260 L100 140 M180 260 L230 120 M420 260 L500 140 M420 260 L370 120 
               M300 180 L300 40 M300 180 L230 60 M300 180 L370 60"
                        stroke="url(#trunkGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="tree-branches"
                    />

                    {/* Glowing realm seeds on tree */}
                    <circle cx="300" cy="40" r="6" fill="#fbbf24" className="tree-node-pulse" />
                    <circle cx="100" cy="140" r="5" fill="#38bdf8" className="tree-node-pulse" />
                    <circle cx="500" cy="140" r="5" fill="#c084fc" className="tree-node-pulse" />
                    <circle cx="300" cy="420" r="7" fill="#f97316" className="tree-node-pulse" />
                </svg>
            </div>

            {/* Floating Ember Particles */}
            <div className="hero-particles" aria-hidden="true">
                <span className="hero-rune-glyph r1">ᚠ</span>
                <span className="hero-rune-glyph r2">ᚢ</span>
                <span className="hero-rune-glyph r3">ᚦ</span>
                <span className="hero-rune-glyph r4">ᚨ</span>
            </div>

            {/* Hero Central Content */}
            <div
                className="hero-content"
                style={{
                    transform: `translate3d(calc(var(--px) * -10px), calc(var(--py) * -6px), 0)`,
                }}
            >
                <div className="hero-eyebrow">
                    <span className="rune">ᚠ</span> NINE REALMS · ONE COSMIC AXIS <span className="rune">ᚱ</span>
                </div>

                <h1 className="hero-title">RAGNARÖK</h1>

                <div className="hero-kicker">A DIGITAL ATLAS OF NORSE MYTHOLOGY</div>

                <p className="hero-sub">
                    Walk the nine realms of Yggdrasil. Meet the ancient Æsir & Vanir gods. Witness the epic sagas and the fate of the cosmos.
                </p>

                <div className="hero-ctas">
                    <button className="rag-btn rag-btn-primary" onClick={onExploreRealms}>
                        <span>ENTER THE REALMS</span>
                        <span>→</span>
                    </button>
                    <button className="rag-btn rag-btn-ghost" onClick={onExploreSagas}>
                        <span>EXPLORE THE SAGAS</span>
                    </button>
                </div>
            </div>

            {/* Scroll Down Indicator */}
            <div className="hero-scroll-indicator" onClick={onExploreRealms}>
                <span className="scroll-text">EXPLORE THE ATLAS</span>
                <div className="scroll-arrow-line">
                    <div className="scroll-drop" />
                </div>
            </div>
        </section>
    );
}
