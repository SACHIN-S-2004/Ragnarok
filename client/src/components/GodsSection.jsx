import React, { useState } from "react";
import "./GodsSection.css";

const GODS = [
    {
        id: "odin",
        name: "ODIN",
        title: "The Allfather & Wanderer",
        realm: "Asgard (Valaskjálf)",
        weapon: "Gungnir Spear & Sleipnir",
        traits: ["Wisdom", "War", "Seiðr", "Rune Magic"],
        rune: "ᚨ ᛟ ᚾ",
        color: "#fbbf24",
        quote: "Nine nights I hung on the wind-swept tree, wounded with a spear, dedicated to Odin, self to myself.",
    },
    {
        id: "thor",
        name: "THOR",
        title: "Warder of Midgard",
        realm: "Asgard (Þrúðheimr)",
        weapon: "Mjölnir Hammer & Megingjörð",
        traits: ["Thunder", "Strength", "Storms", "Protection"],
        rune: "ᚦ ᚢ ᚱ",
        color: "#ef4444",
        quote: "When the sky rumbles and lightning cracks, Thor rides his chariot across the clouds to strike the giants down.",
    },
    {
        id: "freyja",
        name: "FREYJA",
        title: "Lady of Fólkvangr",
        realm: "Vanaheim & Asgard",
        weapon: "Brísingamen & Falcon Cloak",
        traits: ["Love", "Beauty", "War", "Seiðr Sorcery"],
        rune: "ᚠ ᚱ ᛃ",
        color: "#c084fc",
        quote: "First choice of the slain belongs to Freyja; half the fallen warriors ride to her meadow Fólkvangr each day.",
    },
    {
        id: "loki",
        name: "LOKI",
        title: "The Shape-Shifter & Trickster",
        realm: "Jotunheim / Asgard",
        weapon: "Lævateinn & Cunning Words",
        traits: ["Chaos", "Fire", "Change", "Illusion"],
        rune: "ᛚ ᛟ ᚲ",
        color: "#f97316",
        quote: "Friend and enemy to the gods in equal measure, bound in the dark until the trumpets of Ragnarök sound.",
    },
    {
        id: "heimdall",
        name: "HEIMDALL",
        title: "Watchman of Bifröst",
        realm: "Himinbjörg",
        weapon: "Gjallarhorn & Hofund Sword",
        traits: ["Vigilance", "Keen Sight", "Golden Teeth"],
        rune: "ᚺ ᛖ ᛗ",
        color: "#38bdf8",
        quote: "He hears the grass grow on earth and the wool on sheep; his horn Gjallarhorn blasts the warning of the end.",
    },
    {
        id: "tyr",
        name: "TÝR",
        title: "God of War and Justice",
        realm: "Asgard",
        weapon: "Right Hand (Lost to Fenrir)",
        traits: ["Courage", "Law", "Self-Sacrifice"],
        rune: "ᛏ ᚤ ᚱ",
        color: "#10b981",
        quote: "The one-handed god placed his hand between Fenrir's jaws as a pledge of honor, knowing he would lose it.",
    },
    {
        id: "frigg",
        name: "FRIGG",
        title: "Queen of the Æsir",
        realm: "Fensalir (Asgard)",
        weapon: "Distaff of Fate & Weaving",
        traits: ["Foresight", "Fate", "Marriage", "Silence"],
        rune: "ᚠ ᚱ ᛁ",
        color: "#ec4899",
        quote: "She knows the destiny of all beings, though she speaks no prophecies herself.",
    },
    {
        id: "baldr",
        name: "BALDR",
        title: "The Radiant God",
        realm: "Breiðablik",
        weapon: "Absolute Purity & Radiance",
        traits: ["Light", "Joy", "Grace", "Rebirth"],
        rune: "ᛒ ᚨ ᛚ",
        color: "#eab308",
        quote: "So fair and bright was Baldr that light shone from him; his death foretold the coming of Fimbulwinter.",
    },
];

export default function GodsSection() {
    const [selectedGod, setSelectedGod] = useState(GODS[0]);

    return (
        <section className="rag-section gods-section" id="gods">
            <div className="section-head">
                <div className="section-eyebrow">
                    <span className="rune-icon">ᛏ</span> THE NORSE PANTHEON <span className="rune-icon">ᛏ</span>
                </div>
                <h2 className="section-title">THE ÆSIR & VANIR GODS</h2>
                <p className="section-sub">
                    Select any deity to examine their divine titles, sacred runes, artifacts, and legendary tales.
                </p>
            </div>

            <div className="gods-grid">
                {GODS.map((god) => {
                    const isSelected = selectedGod.id === god.id;
                    return (
                        <div
                            key={god.id}
                            className={`god-card ${isSelected ? "card-selected" : ""}`}
                            onClick={() => setSelectedGod(god)}
                            style={{ "--god-accent": god.color }}
                        >
                            <div className="god-card-badge">{god.rune.split(" ")[0]}</div>
                            <div className="god-card-header">
                                <div className="god-card-name">{god.name}</div>
                                <div className="god-card-title">{god.title}</div>
                            </div>
                            <div className="god-card-traits">
                                {god.traits.slice(0, 3).map((trait) => (
                                    <span key={trait} className="trait-pill">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected God Detail Drawer */}
            {selectedGod && (
                <div className="god-drawer" style={{ "--god-accent": selectedGod.color }}>
                    <div className="drawer-rune-giant">{selectedGod.rune}</div>
                    <div className="drawer-content">
                        <div className="drawer-header">
                            <span className="drawer-realm">{selectedGod.realm}</span>
                            <h3 className="drawer-name">{selectedGod.name}</h3>
                            <div className="drawer-title">{selectedGod.title}</div>
                        </div>

                        <blockquote className="drawer-quote">"{selectedGod.quote}"</blockquote>

                        <div className="drawer-meta-grid">
                            <div className="meta-box">
                                <div className="meta-label">SACRED WEAPON / RELIC</div>
                                <div className="meta-val">{selectedGod.weapon}</div>
                            </div>
                            <div className="meta-box">
                                <div className="meta-label">DIVINE DOMAINS</div>
                                <div className="meta-val">{selectedGod.traits.join(" · ")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
