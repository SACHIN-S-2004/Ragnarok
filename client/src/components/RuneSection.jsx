import React, { useState } from "react";
import "./RuneSection.css";

const RUNES_DATA = [
    { glyph: "ᚠ", name: "FEHU", sound: "F", meaning: "Wealth, Abundance, Mobile Energy" },
    { glyph: "ᚢ", name: "URUZ", sound: "U", meaning: "Untamed Strength, Endurance, Vitality" },
    { glyph: "ᚦ", name: "THURISAZ", sound: "TH", meaning: "Giant, Defended Force, Gateway" },
    { glyph: "ᚨ", name: "ANSUZ", sound: "A", meaning: "Odin's Breath, Spoken Word, Inspiration" },
    { glyph: "ᚱ", name: "RAIDHO", sound: "R", meaning: "The Journey, Wheel of Destiny, Right Action" },
    { glyph: "ᚲ", name: "KAUNAN", sound: "K / C", meaning: "The Torch, Controlled Flame, Illumination" },
    { glyph: "ᚷ", name: "GEBO", sound: "G", meaning: "Sacred Gift, Partnership, Exchange" },
    { glyph: "ᚹ", name: "WUNJO", sound: "W / V", meaning: "Joy, Harmony, Fellowship" },
    { glyph: "ᚺ", name: "HAGALAZ", sound: "H", meaning: "Hail, Transformation, Disruptive Storm" },
    { glyph: "ᚾ", name: "NAUDIZ", sound: "N", meaning: "Need, Friction, Resistance & Growth" },
    { glyph: "ᛁ", name: "ISA", sound: "I", meaning: "Ice, Stillness, Concentration, Stagnation" },
    { glyph: "ᛃ", name: "JERA", sound: "J / Y", meaning: "Harvest, Natural Cycles, Reward" },
];

const RUNE_MAP = {
    a: "ᚨ", b: "ᛒ", c: "ᚲ", d: "ᛞ", e: "ᛖ", f: "ᚠ", g: "ᚷ", h: "ᚺ", i: "ᛁ",
    j: "ᛃ", k: "ᚲ", l: "ᛚ", m: "ᛗ", n: "ᚾ", o: "ᛟ", p: "ᛈ", q: "ᚲ", r: "ᚱ",
    s: "ᛊ", t: "ᛏ", u: "ᚢ", v: "ᚹ", w: "ᚹ", x: "ᚲᛊ", y: "ᛃ", z: "ᛉ", " ": " ",
};

export default function RuneSection() {
    const [inputText, setInputText] = useState("");
    const [copied, setCopied] = useState(false);
    const [activeRune, setActiveRune] = useState(RUNES_DATA[3]);

    const runicOutput = inputText
        .toLowerCase()
        .split("")
        .map((ch) => RUNE_MAP[ch] || "")
        .join(" ");

    const handleCopy = () => {
        if (!runicOutput) return;
        navigator.clipboard.writeText(runicOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="rag-section runes-section" id="runes">
            <div className="section-head">
                <div className="section-eyebrow">
                    <span className="rune-icon">ᚦ</span> THE ELDER FUTHARK <span className="rune-icon">ᚦ</span>
                </div>
                <h2 className="section-title">THE LANGUAGE OF FATE</h2>
                <p className="section-sub">
                    Sacred symbols carved into stone and wood for divination, casting, and ancient inscriptions.
                </p>
            </div>

            {/* Interactive Rune Grid */}
            <div className="runes-grid">
                {RUNES_DATA.map((r) => (
                    <div
                        key={r.name}
                        className={`rune-tile ${activeRune.name === r.name ? "rune-active" : ""}`}
                        onClick={() => setActiveRune(r)}
                    >
                        <div className="tile-glyph">{r.glyph}</div>
                        <div className="tile-name">{r.name}</div>
                        <div className="tile-sound">[{r.sound}]</div>
                    </div>
                ))}
            </div>

            {/* Selected Rune Detail Pill */}
            {activeRune && (
                <div className="rune-detail-pill">
                    <span className="detail-glyph">{activeRune.glyph}</span>
                    <div>
                        <div className="detail-title">{activeRune.name} (Phonetic: {activeRune.sound})</div>
                        <div className="detail-meaning">DIVINATORY MEANING: {activeRune.meaning}</div>
                    </div>
                </div>
            )}

            {/* Rune Transliterator Workshop */}
            <div className="rune-workshop">
                <div className="workshop-header">
                    <span className="rune-icon">ᚨ</span> RUNE TRANSLITERATOR WORKSHOP <span className="rune-icon">ᚨ</span>
                </div>

                <div className="workshop-input-wrap">
                    <input
                        type="text"
                        className="workshop-input"
                        maxLength={26}
                        placeholder="Type any word (e.g. ODIN, VALHALLA, THOR)..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                </div>

                <div className="workshop-output">
                    {runicOutput || <span className="output-placeholder">᛫ ᛫ ᛫ ᛫ ᛫</span>}
                </div>

                {runicOutput && (
                    <button className="rag-btn rag-btn-ghost copy-btn" onClick={handleCopy}>
                        <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY RUNIC INSCRIPTION"}</span>
                    </button>
                )}

                <div className="workshop-note">
                    Transliterated into 24-character Elder Futhark runes for educational and mythic exploration.
                </div>
            </div>
        </section>
    );
}
