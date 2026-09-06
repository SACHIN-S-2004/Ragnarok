import React, { useState } from "react";
import "./SagasSection.css";

const SAGAS = [
    {
        num: "01",
        title: "ODIN'S SACRIFICE FOR WISDOM",
        source: "Hávamál · Poetic Edda",
        summary:
            "To gain divine foresight and master runic magic, the Allfather surrendered an eye at Mímir's well and hung nine full nights from the wind-swept boughs of Yggdrasil.",
        fullStory:
            "Wisdom came not easily even to the chief of gods. Odin journeyed to Mímir's Well at the root of Jotunheim and paid with his right eye to drink from the waters of supreme understanding. Later, piercing himself with his spear Gungnir, he hung from Yggdrasil for nine days and nights without bread or mead until the secret glyphs of the runes revealed themselves in a flash of light.",
        rune: "ᚨ",
    },
    {
        num: "02",
        title: "THOR & THE WORLD SERPENT",
        source: "Hymiskviða · Prose Edda",
        summary:
            "Rowing far into the ocean on Hymir's boat, Thor baited his line with an ox head and hooked Jörmungandr, sparking a rivalry that would culminate at Ragnarök.",
        fullStory:
            "Using the head of Hymir's prize bull as bait, Thor cast his line deep into the uncharted abyss. When Jörmungandr took the hook, the sea churned violently. Thor pulled with such ferocious strength that his legs burst through the floor of the boat to rest on the ocean bed. Just as Thor raised Mjölnir to strike, the terrified giant Hymir cut the line, allowing the serpent to plunge back into the depths.",
        rune: "ᚦ",
    },
    {
        num: "03",
        title: "THE BINDING OF FENRIR",
        source: "Gylfaginning · Snorri Sturluson",
        summary:
            "As the monstrous wolf Fenrir grew too vast for Asgard, the dwarf smiths spun Gleipnir from impossible things — bound only when Týr pledged his hand.",
        fullStory:
            "Fenrir shattered iron fetters with ease. The gods commissioned the dwarves to forge Gleipnir from six non-existent things: the sound of a cat's footfall, the beard of a woman, the roots of a mountain, the sinews of a bear, the breath of a fish, and the spittle of a bird. Fenrir, suspecting trickery, demanded a god place their right hand in his mouth as a pledge of good faith. Týr stepped forward without hesitation.",
        rune: "ᛏ",
    },
    {
        num: "04",
        title: "THE DOOM OF BALDR",
        source: "Völuspá · Prose Edda",
        summary:
            "Frigg exacted oaths from all things in creation to harm Baldr — save for the humble mistletoe, which Loki fashioned into a fatal dart.",
        fullStory:
            "Plagued by terrible dreams of Baldr's death, Frigg extracted solemn vows from fire, water, iron, stone, beasts, and diseases never to harm her son. The gods made a game of hurling weapons at the invulnerable Baldr. But Loki discovered Frigg had deemed the young mistletoe sprout too tiny to demand an oath. Loki guided the blind god Höðr to hurl a mistletoe dart, striking Baldr down.",
        rune: "ᛒ",
    },
    {
        num: "05",
        title: "THE ÆSIR–VANIR WAR",
        source: "Ynglinga Saga",
        summary:
            "The first conflict in creation fought between two divine tribes ended not in destruction, but in a sacred truce and exchange of noble hostages.",
        fullStory:
            "When the Æsir attempted to slay the Vanir sorceress Gullveig three times in Odin's hall, war broke out. Neither side could gain victory: the Vanir smashed Asgard's walls with magic, while the Æsir fought with unmatched martial might. Realizing endless battle served no one, they united through hostages: Njörðr, Freyr, and Freyja came to Asgard, while Hœnir and Mímir went to Vanaheim.",
        rune: "ᚠ",
    },
    {
        num: "06",
        title: "THE TWILIGHT: RAGNARÖK",
        source: "Völuspá · prophecy of the Völva",
        summary:
            "Three harsh Fimbulwinters herald the collapse of oaths, the shattering of fetters, and the final war at the field of Vigrid.",
        fullStory:
            "Fimbulwinter covers the earth in snow and ice without summer. Fenrir breaks Gleipnir; Jörmungandr rises from the ocean flooding the lands; Surtr leads the fire giants across Bifröst. Heimdall blows Gjallarhorn to rouse the gods for their final battle. Though gods and monsters slay each other, the earth sinks into the sea, only to rise reborn, green and radiant.",
        rune: "ᚾ",
    },
];

export default function SagasSection() {
    const [activeSagaNum, setActiveSagaNum] = useState(null);

    const activeSaga = SAGAS.find((s) => s.num === activeSagaNum);

    return (
        <section className="rag-section sagas-section" id="sagas">
            <div className="section-head">
                <div className="section-eyebrow">
                    <span className="rune-icon">ᚱ</span> TALES OF THE OLD EDDAS <span className="rune-icon">ᚱ</span>
                </div>
                <h2 className="section-title">THE SAGAS OF YGGDRASIL</h2>
                <p className="section-sub">
                    Chronicles of sacrifice, heroic battles, deceit, and prophecy recorded in the ancient Icelandic Eddas.
                </p>
            </div>

            <div className="sagas-timeline">
                {SAGAS.map((saga) => (
                    <div key={saga.num} className="saga-card">
                        <div className="saga-badge">
                            <span className="saga-num">{saga.num}</span>
                            <span className="saga-rune">{saga.rune}</span>
                        </div>

                        <div className="saga-body">
                            <div className="saga-source">{saga.source}</div>
                            <h3 className="saga-title">{saga.title}</h3>
                            <p className="saga-summary">{saga.summary}</p>
                            <button
                                className="saga-read-btn"
                                onClick={() => setActiveSagaNum(saga.num)}
                            >
                                <span>READ FULL CHRONICLE</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for full story */}
            {activeSaga && (
                <div className="saga-modal-overlay" onClick={() => setActiveSagaNum(null)}>
                    <div className="saga-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setActiveSagaNum(null)}>
                            ✕
                        </button>
                        <div className="modal-source">{activeSaga.source}</div>
                        <h3 className="modal-title">{activeSaga.title}</h3>
                        <p className="modal-text">{activeSaga.fullStory}</p>
                    </div>
                </div>
            )}
        </section>
    );
}
