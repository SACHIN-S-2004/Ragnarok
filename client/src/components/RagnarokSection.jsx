import React, { useState } from "react";
import "./RagnarokSection.css";

const STAGES = [
    {
        id: 1,
        title: "I. FIMBULWINTER",
        sub: "The Great Winter",
        rune: "ᛁ",
        color: "#38bdf8",
        desc: "Three endless winters strike Midgard without summer between them. Snow falls from all directions, winds howl, and oaths shatter as law dissolves.",
    },
    {
        id: 2,
        title: "II. THE BOUND BREAK FREE",
        sub: "Unshackled Monsters",
        rune: "ᛚ",
        color: "#f97316",
        desc: "Gleipnir breaks and Fenrir runs free. Loki escapes his subterranean prison of serpents, commanding Naglfar, the ship fashioned from dead men's nails.",
    },
    {
        id: 3,
        title: "III. JÖRMUNGANDR RISES",
        sub: "The Ocean Serpent",
        rune: "ᚦ",
        color: "#ef4444",
        desc: "Jörmungandr twists in fury, surging onto land and causing tidal waves to engulf Midgard while spewing venom that poisons the sea and sky.",
    },
    {
        id: 4,
        title: "IV. GJALLARHORN BLASTS",
        sub: "Call to the Field of Vigrid",
        rune: "ᚺ",
        color: "#fbbf24",
        desc: "Heimdall stands at Bifröst and sounds Gjallarhorn. Odin rides to Mímir's well for last counsel, then leads the Einherjar warriors to battle.",
    },
    {
        id: 5,
        title: "V. THE FINAL CLASH",
        sub: "Gods vs. Monsters",
        rune: "ᛏ",
        color: "#c084fc",
        desc: "At the plain of Vigrid, Odin is swallowed by Fenrir; Vidar steps on the wolf's jaw; Thor slays Jörmungandr but dies from venom after nine paces.",
    },
    {
        id: 6,
        title: "VI. SURTR'S INFERNO",
        sub: "The World Burns",
        rune: "ᛊ",
        color: "#ea580c",
        desc: "Surtr flings fire across the nine realms. Yggdrasil quakes in flames, stars fall from the sky, and the scorched earth sinks into the boiling ocean.",
    },
    {
        id: 7,
        title: "VII. GIMLÉ & REBIRTH",
        sub: "The World Renewed",
        rune: "ᛒ",
        color: "#10b981",
        desc: "A green, fruitful world rises anew from the ocean. Baldr returns from Hel. Lif and Lifthrasir emerge from Yggdrasil to repopulate mankind.",
    },
];

export default function RagnarokSection() {
    const [activeStageId, setActiveStageId] = useState(1);

    const currentStage = STAGES.find((s) => s.id === activeStageId) || STAGES[0];

    return (
        <section className="rag-section ragnarok-section" id="ragnarok">
            <div className="section-head">
                <div className="section-eyebrow">
                    <span className="rune-icon">ᛊ</span> THE FINAL PROPHECY <span className="rune-icon">ᛊ</span>
                </div>
                <h2 className="section-title">THE END & REBIRTH OF THE WORLD</h2>
                <p className="section-sub">
                    Experience the seven stages of Ragnarök — from the freezing Fimbulwinter to the golden dawn of Gimlé.
                </p>
            </div>

            {/* Stage Selector Timeline */}
            <div className="ragnarok-stepper">
                {STAGES.map((s) => (
                    <button
                        key={s.id}
                        className={`step-btn ${activeStageId === s.id ? "step-active" : ""}`}
                        onClick={() => setActiveStageId(s.id)}
                        style={{ "--step-color": s.color }}
                    >
                        <span className="step-rune">{s.rune}</span>
                        <span className="step-num">{s.id}</span>
                    </button>
                ))}
            </div>

            {/* Active Stage Display Panel */}
            <div className="ragnarok-stage-card" style={{ "--stage-color": currentStage.color }}>
                <div className="stage-header">
                    <div className="stage-rune-badge">{currentStage.rune}</div>
                    <div>
                        <div className="stage-sub" style={{ color: currentStage.color }}>
                            STAGE {currentStage.id} OF 7 · {currentStage.sub}
                        </div>
                        <h3 className="stage-title">{currentStage.title}</h3>
                    </div>
                </div>

                <p className="stage-desc">{currentStage.desc}</p>

                <div className="stage-controls">
                    <button
                        className="rag-btn rag-btn-ghost"
                        disabled={activeStageId === 1}
                        onClick={() => setActiveStageId((prev) => Math.max(1, prev - 1))}
                    >
                        ← PREVIOUS STAGE
                    </button>
                    <button
                        className="rag-btn rag-btn-primary"
                        disabled={activeStageId === STAGES.length}
                        onClick={() => setActiveStageId((prev) => Math.min(STAGES.length, prev + 1))}
                    >
                        NEXT STAGE →
                    </button>
                </div>
            </div>
        </section>
    );
}
