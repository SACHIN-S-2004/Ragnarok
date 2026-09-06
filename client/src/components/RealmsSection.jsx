import React, { useState } from "react";
import "./RealmsSection.css";

const REALMS = [
    {
        id: "asgard",
        name: "ASGARD",
        rune: "ᚨ",
        tag: "Realm of the High Æsir Gods",
        people: "Odin · Thor · Frigg · Heimdall",
        color: "#fbbf24",
        element: "Celestial Gold",
        desc: "The golden citadel situated in the high heavens of Yggdrasil, connected to Midgard by Bifröst, the shimmering rainbow bridge.",
        x: 50,
        y: 12,
    },
    {
        id: "vanaheim",
        name: "VANAHEIM",
        rune: "ᚠ",
        tag: "Home of the Ancient Vanir",
        people: "Freyja · Freyr · Njörðr",
        color: "#10b981",
        element: "Nature & Seiðr Magic",
        desc: "A lush, fertile realm of ancient forests and coastal waters, birth realm of sorcery, nature spirits, and weather wisdom.",
        x: 20,
        y: 24,
    },
    {
        id: "alfheim",
        name: "ALFHEIM",
        rune: "ᛖ",
        tag: "Domain of Light Elves",
        people: "Ljósálfar (Light Elves)",
        color: "#06b6d4",
        element: "Radiant Ether",
        desc: "A luminous world ruled by Freyr, filled with ethereal beauty, light magic, and beings fairer than the sun.",
        x: 78,
        y: 24,
    },
    {
        id: "midgard",
        name: "MIDGARD",
        rune: "ᛗ",
        tag: "World of Mankind",
        people: "Mortals · Encircled by Jörmungandr",
        color: "#f59e0b",
        element: "Earth & Ocean",
        desc: "The central world inhabited by humans, surrounded by an endless ocean where Jörmungandr, the World Serpent, bites his own tail.",
        x: 50,
        y: 46,
    },
    {
        id: "jotunheim",
        name: "JÖTUNHEIM",
        rune: "ᚦ",
        tag: "Wilderness of Giants",
        people: "Skaði · Útgarða-Loki · Frost Giants",
        color: "#3b82f6",
        element: "Frost & Granite",
        desc: "A untamed realm of towering ironwood forests, icy peaks, and chaotic sea-cliffs where the ancient Jötnar dwell.",
        x: 84,
        y: 50,
    },
    {
        id: "svartalfheim",
        name: "SVARTALFHEIM",
        rune: "ᛞ",
        tag: "Subterranean Forge World",
        people: "Sindri · Brokkr · Master Dwarves",
        color: "#d97706",
        element: "Molten Bronze & Ore",
        desc: "Deep caverns beneath the earth where master dwarf smiths forge divine relics including Thor's hammer Mjölnir and Odin's spear Gungnir.",
        x: 16,
        y: 52,
    },
    {
        id: "muspelheim",
        name: "MUSPELHEIM",
        rune: "ᛊ",
        tag: "Realm of Primordial Fire",
        people: "Surtr · Fire Jötnar",
        color: "#ef4444",
        element: "Living Magma",
        desc: "A blazing sea of fire and heat, guarded by Surtr with his flaming sword, destined to engulf the worlds at Ragnarök.",
        x: 68,
        y: 70,
    },
    {
        id: "niflheim",
        name: "NIFLHEIM",
        rune: "ᛁ",
        tag: "Realm of Primordial Ice & Mist",
        people: "Hvergelmir Spring · Frost Mists",
        color: "#38bdf8",
        element: "Glacial Frost",
        desc: "The dark, freezing world of icy mists and venomous rivers, existing before creation itself at the northern root of Yggdrasil.",
        x: 32,
        y: 70,
    },
    {
        id: "hel",
        name: "HEL",
        rune: "ᚺ",
        tag: "Underworld of the Dead",
        people: "Hel (Goddess of Death) · Garmr",
        color: "#a855f7",
        element: "Spectral Gloom",
        desc: "The gloomy subterranean realm where those who died of old age or sickness dwell beneath the roots of Yggdrasil.",
        x: 50,
        y: 88,
    },
];

export default function RealmsSection() {
    const [activeRealmId, setActiveRealmId] = useState("midgard");
    const activeRealm = REALMS.find((r) => r.id === activeRealmId) || REALMS[3];

    return (
        <section className="rag-section realms-section" id="realms">
            <div className="section-head">
                <div className="section-eyebrow">
                    <span className="rune-icon">ᚨ</span> THE COSMIC TREE ATLAS <span className="rune-icon">ᚱ</span>
                </div>
                <h2 className="section-title">THE NINE REALMS</h2>
                <p className="section-sub">
                    Nine interconnected worlds suspended within the branches and roots of Yggdrasil. Click or hover any realm node to reveal its cosmic story.
                </p>
            </div>

            <div className="realms-layout">
                {/* Interactive SVG Cosmic Tree Node Map */}
                <div className="realms-map-wrap">
                    <svg className="realms-map-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                        {REALMS.map((r) =>
                            r.id !== "midgard" ? (
                                <line
                                    key={r.id}
                                    className={`realm-link ${activeRealmId === r.id ? "link-active" : ""}`}
                                    x1="50"
                                    y1="46"
                                    x2={r.x}
                                    y2={r.y}
                                    style={{ stroke: activeRealmId === r.id ? r.color : "rgba(255, 255, 255, 0.12)" }}
                                />
                            ) : null
                        )}
                    </svg>

                    {REALMS.map((r) => {
                        const isActive = activeRealmId === r.id;
                        return (
                            <div
                                key={r.id}
                                className={`realm-node ${isActive ? "active" : ""}`}
                                style={{
                                    left: `${r.x}%`,
                                    top: `${r.y}%`,
                                    "--realm-color": r.color,
                                }}
                                onClick={() => setActiveRealmId(r.id)}
                                onMouseEnter={() => setActiveRealmId(r.id)}
                                tabIndex={0}
                                role="button"
                                aria-label={r.name}
                            >
                                <div className="node-beacon">
                                    <span className="node-rune">{r.rune}</span>
                                </div>
                                <div className="node-title">{r.name}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Selected Realm Showcase Glass Card */}
                <div className="realm-showcase-card" style={{ "--realm-theme": activeRealm.color }}>
                    <div className="showcase-header">
                        <div className="showcase-rune-badge" style={{ backgroundColor: `${activeRealm.color}20`, borderColor: activeRealm.color, color: activeRealm.color }}>
                            {activeRealm.rune}
                        </div>
                        <div>
                            <div className="showcase-element" style={{ color: activeRealm.color }}>
                                {activeRealm.element}
                            </div>
                            <h3 className="showcase-title">{activeRealm.name}</h3>
                        </div>
                    </div>

                    <div className="showcase-tag">{activeRealm.tag}</div>

                    <p className="showcase-desc">{activeRealm.desc}</p>

                    <div className="showcase-footer">
                        <div className="showcase-label">KEY INHABITANTS</div>
                        <div className="showcase-people">{activeRealm.people}</div>
                    </div>

                    {/* Realm Quick Selector Chips */}
                    <div className="realm-chips">
                        {REALMS.map((r) => (
                            <button
                                key={r.id}
                                className={`realm-chip ${activeRealmId === r.id ? "chip-active" : ""}`}
                                onClick={() => setActiveRealmId(r.id)}
                                style={{
                                    "--chip-color": r.color,
                                }}
                            >
                                {r.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
