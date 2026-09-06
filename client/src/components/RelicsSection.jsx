import React from "react";
import "./RelicsSection.css";

const ARTIFACTS = [
    {
        id: "mjolnir",
        name: "MJÖLNIR",
        owner: "Thor",
        rune: "ᚦ",
        power: "Mountain-Shattering Thunder",
        origin: "Forged by dwarf brothers Sindri and Brokkr; handle cut short due to Loki's interference.",
    },
    {
        id: "gungnir",
        name: "GUNGNIR",
        owner: "Odin",
        rune: "ᚨ",
        power: "Infallible Precision",
        origin: "Crafted by the Sons of Ivaldi; runes carved into its point seal inviolable oaths.",
    },
    {
        id: "draupnir",
        name: "DRAUPNIR",
        owner: "Odin",
        rune: "ᛟ",
        power: "Infinite Gold Multiplier",
        origin: "Every ninth night, eight gold rings of equal weight drip from Draupnir's band.",
    },
    {
        id: "brisingamen",
        name: "BRÍSINGAMEN",
        owner: "Freyja",
        rune: "ᚠ",
        power: "Divine Radiance & Charm",
        origin: "Forged by four dwarven masters; so dazzling that no army or spell could withstand its beauty.",
    },
    {
        id: "gjallarhorn",
        name: "GJALLARHORN",
        owner: "Heimdall",
        rune: "ᚺ",
        power: "Nine-Realm Warning Blast",
        origin: "Kept beneath the roots of Yggdrasil near Mímir's well until the day of Ragnarök.",
    },
];

export default function RelicsSection() {
    return (
        <section className="rag-section relics-section">
            <div className="section-head">
                <div className="section-eyebrow">
                    <span className="rune-icon">ᛟ</span> DIVINE FORGE & WEAPONRY <span className="rune-icon">ᛟ</span>
                </div>
                <h2 className="section-title">THE RELICS OF THE GODS</h2>
                <p className="section-sub">
                    Sacred artifacts forged by dwarven smiths in the molten depths of Svartalfheim.
                </p>
            </div>

            <div className="relics-grid">
                {ARTIFACTS.map((item) => (
                    <div key={item.id} className="relic-card">
                        <div className="relic-orb-wrap">
                            <div className="relic-orb">
                                <span className="relic-rune">{item.rune}</span>
                            </div>
                            <div className="relic-ring" />
                        </div>

                        <h3 className="relic-name">{item.name}</h3>
                        <div className="relic-owner">WIELDER: {item.owner}</div>
                        <div className="relic-power">{item.power}</div>
                        <p className="relic-desc">{item.origin}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
