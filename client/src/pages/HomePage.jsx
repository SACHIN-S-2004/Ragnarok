import React, { useEffect, useMemo, useRef, useState } from "react";
import yggdrasilBg from "../assets/ragnarok-yggdrasil-bg.webp";
import thorCutout from "../assets/ragnarok-thor-cutout.png";
import odinCutout from "../assets/ragnarok-odin-cutout.png";

/**
 * RAGNARÖK — standalone cinematic landing-page component.
 *
 * Place these files next to this component in an `assets/` folder:
 * - ragnarok-yggdrasil-bg.webp
 * - ragnarok-thor-cutout.webp
 * - ragnarok-odin-cutout.webp
 *
 * Optional: pass `assetBase="/assets"` or another public URL prefix.
 */
export default function RagnarokLandingPage({ assetBase = "./assets" }) {
  const asset = (name) => `${assetBase}/${name}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRealm, setActiveRealm] = useState(3);
  const [activeGod, setActiveGod] = useState(0);
  const [word, setWord] = useState("RAGNAROK");
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const heroRef = useRef(null);
  const artifactRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = ["hero", "realms", "gods", "sagas", "artifacts", "runes"]
      .map((id) => document.getElementById(id)).filter(Boolean);
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setNavScrolled(window.scrollY > 28);
        if (!reduced) document.documentElement.style.setProperty("--rk-scroll-y", `${window.scrollY}px`);
        const current = sections.reduce((found, section) => {
          return section.getBoundingClientRect().top <= window.innerHeight * 0.35 ? section.id : found;
        }, "hero");
        setActiveSection(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("rk-visible", entry.isIntersecting));
    }, { threshold: 0.12 });
    document.querySelectorAll(".rk-section, .rk-final").forEach((section) => revealObserver.observe(section));
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("scroll", onScroll); revealObserver.disconnect(); };
  }, []);

  const handleHeroPointer = (event) => {
    if (!heroRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroRef.current.style.setProperty("--rk-mx", `${x * 18}px`);
    heroRef.current.style.setProperty("--rk-my", `${y * 12}px`);
  };

  const handleArtifactPointer = (event) => {
    if (!artifactRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = artifactRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    artifactRef.current.style.setProperty("--rk-tilt-x", `${y * -5}deg`);
    artifactRef.current.style.setProperty("--rk-tilt-y", `${x * 7}deg`);
    artifactRef.current.style.setProperty("--rk-glow-x", `${(x + 0.5) * 100}%`);
    artifactRef.current.style.setProperty("--rk-glow-y", `${(y + 0.5) * 100}%`);
  };

  const resetPointer = (ref) => {
    ref.current?.style.setProperty("--rk-mx", "0px");
    ref.current?.style.setProperty("--rk-my", "0px");
    ref.current?.style.setProperty("--rk-tilt-x", "0deg");
    ref.current?.style.setProperty("--rk-tilt-y", "0deg");
  };

  const realms = [
    ["ASGARD", "Home of the Æsir", "Realm of gods and golden halls."],
    ["VANAHEIM", "Land of the Vanir", "A fertile world of old magic."],
    ["ALFHEIM", "Realm of light elves", "Where radiance takes form."],
    ["MIDGARD", "The middle world", "Where gods and mortals meet."],
    ["JÖTUNHEIM", "Land of the giants", "A wilderness beyond the wall."],
    ["SVARTALFHEIM", "Home of the dwarves", "Forge, stone, and hidden fire."],
    ["MUSPELHEIM", "Land of fire", "The first spark before the end."],
    ["NIFLHEIM", "World of ice and mist", "A breath older than the gods."],
    ["HEL", "Realm of the dead", "The quiet shore beneath the roots."],
  ];
  const gods = [
    ["ODIN", "THE ALL-FATHER", "Wisdom / Sacrifice / Prophecy"],
    ["THOR", "THE STORM-BEARER", "Strength / Thunder / Protection"],
    ["FREYJA", "THE SEERESS", "Beauty / War / Seiðr"],
    ["LOKI", "THE SHAPE-CHANGER", "Cunning / Chaos / Fire"],
    ["HEIMDALL", "THE WATCHMAN", "Sight / Sound / Bifröst"],
    ["TÝR", "THE OATH-KEEPER", "Courage / Law / Sacrifice"],
  ];
  const sagas = [
    ["01", "ODIN’S SACRIFICE", "He gives an eye for wisdom, and himself to the runes."],
    ["02", "THOR & JÖRMUNGANDR", "The serpent rises and the seas answer."],
    ["03", "THE BINDING OF FENRIR", "The gods bind the great wolf, knowing the cost."],
    ["04", "BALDR’S DEATH", "Darkness falls as prophecy takes its first breath."],
    ["05", "THE ÆSIR–VANIR WAR", "Old wounds ignite and the worlds change hands."],
    ["06", "RAGNARÖK", "The final battle ends one world and begins another."],
  ];
  const runeMap = { A: "ᚨ", B: "ᛒ", C: "ᚲ", D: "ᛞ", E: "ᛖ", F: "ᚠ", G: "ᚷ", H: "ᚺ", I: "ᛁ", J: "ᛃ", K: "ᚲ", L: "ᛚ", M: "ᛗ", N: "ᚾ", O: "ᛟ", P: "ᛈ", Q: "ᚲ", R: "ᚱ", S: "ᛊ", T: "ᛏ", U: "ᚢ", V: "ᚹ", W: "ᚹ", X: "ᛪ", Y: "ᛃ", Z: "ᛉ" };
  const runes = useMemo(() => word.toUpperCase().split("").map((letter) => runeMap[letter] || letter).join("  "), [word]);
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return <>
    <style>{styles}</style>
    <main className="rk-shell">
      <div
        className="rk-fixed-yggdrasil"
        style={{ backgroundImage: `url(${yggdrasilBg})` }}
      />
      <header className={`rk-nav ${navScrolled ? "rk-nav-scrolled" : ""}`}>
        <button className="rk-brand" onClick={() => scrollTo("hero")}><span className="rk-mark">ᛉ</span><span>RAGNARÖK</span></button>
        <nav className={menuOpen ? "rk-links rk-open" : "rk-links"}>{["realms", "gods", "sagas", "artifacts", "runes"].map((item) => <button className={activeSection === item ? "rk-nav-active" : ""} key={item} onClick={() => scrollTo(item)}>{item}</button>)}</nav>
        <button className="rk-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "×" : "☰"}</button>
      </header>

      <section
        id="hero"
        ref={heroRef}
        className="rk-hero"
        onPointerMove={handleHeroPointer}
        onPointerLeave={() => resetPointer(heroRef)}
      >
        <div className="rk-aurora" /><div className="rk-lightning" /><div className="rk-particles" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--i": index }} />)}</div>
        <div className="rk-meta rk-left">ÆSIR <i /> VANIR <i /> JÖTNAR</div><div className="rk-meta rk-right">NINE REALMS <i /> ONE WORLD TREE <i /> ANCIENT STORIES</div>
        <div className="rk-orbit">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ</div>
        <div className="rk-hero-title"><small>THE LAST AGE OF THE GODS</small><h1>RAGNARÖK</h1><p>THOR <span>THE STORM-BEARER</span></p></div>
        <img className="rk-thor" src={thorCutout} alt="Mythological Thor holding Mjölnir" />
        <div className="rk-strip">{["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ"].map((rune, index) => <span key={index}>{rune}</span>)}</div>
        <div className="rk-hero-bottom"><div><strong>THE TWILIGHT OF THE GODS</strong><p>Explore the gods, realms, artifacts and stories of the Norse world.</p></div><div className="rk-actions"><button className="rk-button" onClick={() => scrollTo("realms")}>ENTER THE NINE REALMS →</button><button className="rk-text-button" onClick={() => scrollTo("sagas")}>EXPLORE THE SAGAS</button></div></div>
        <button className="rk-scroll" onClick={() => scrollTo("realms")}>SCROLL TO ENTER <span>↓</span></button>
      </section>

      <section id="realms" className="rk-section rk-realms"><div className="rk-intro"><small>THE WORLD TREE</small><h2>THE NINE<br /><em>REALMS</em></h2><p>From the roots of Yggdrasil to the highest branches, the nine realms are bound together. Each world a destiny. Each path a story.</p><button className="rk-text-button" onClick={() => scrollTo("gods")}>EXPLORE THE REALMS →</button></div><div className="rk-atlas"><div className="rk-tree" />{realms.map(([name, subtitle, detail], index) => <button key={name} className={`rk-realm rk-r${index} ${activeRealm === index ? "rk-active" : ""}`} onClick={() => setActiveRealm(index)}><b>ᛉ</b><strong>{name}</strong><small>{subtitle}</small>{activeRealm === index && <em>{detail}</em>}</button>)}</div></section>

      <section id="gods" className="rk-section rk-gods"><div className="rk-odin"><img src={odinCutout} alt="Odin with his ravens" /><span>ARCHIVE PLATE / ÆSIR 01</span></div><div className="rk-god-copy"><small>THE ÆSIR & VANIR</small><h2>MEET<br /><em>THE GODS</em></h2><p>Ancient beings of power, wisdom and will. Their stories shape the worlds.</p><div className="rk-selector">{gods.map(([name], index) => <button className={activeGod === index ? "rk-selected" : ""} key={name} onClick={() => setActiveGod(index)}>{name}</button>)}</div><div className="rk-god-detail"><small>{gods[activeGod][1]}</small><h3>{gods[activeGod][0]}</h3><p>{gods[activeGod][2]}</p></div></div></section>

      <section id="sagas" className="rk-section rk-sagas"><small>STORIES WRITTEN IN FATE</small><h2>THE <em>SAGAS</em></h2><div className="rk-saga-line">{sagas.map(([number, title, copy]) => <article key={number}><b>{number}</b><i /><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

      <section id="artifacts" className="rk-section rk-artifacts"><small>RELICS OF THE GODS</small><h2>THE <em>RELICS</em></h2><div ref={artifactRef} onPointerMove={handleArtifactPointer} onPointerLeave={() => resetPointer(artifactRef)} className="rk-artifact-plate"><div className="rk-artifact-ghost">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ</div><p>MJÖLNIR · GUNGNIR · DRAUPNIR · BRÍSINGAMEN · GJALLARHORN</p></div></section>

      <section id="runes" className="rk-section rk-runes"><small>ANCIENT SYMBOLS / MODERN INTERPRETATION</small><h2>RUNE <em>TRANSLITERATOR</em></h2><div className="rk-translator"><label>WRITE YOUR WORD<input value={word} onChange={(event) => setWord(event.target.value.replace(/[^a-z]/gi, "").slice(0, 18))} /></label><span className="rk-arrow">→</span><div><label>IN RUNES</label><strong className="rk-rune-output">{(runes || "ᚠ").split("").map((rune, index) => <span key={`${rune}-${index}`}>{rune === " " ? "\u00a0" : rune}</span>)}</strong></div><button className="rk-button" onClick={() => setWord(word.trim().toUpperCase())}>TRANSLATE</button></div></section>

      <section className="rk-final"><small>THE END IS WRITTEN. THE FUTURE IS YOURS.</small><h2>RAGNARÖK</h2><button className="rk-button" onClick={() => scrollTo("hero")}>RETURN TO THE BEGINNING →</button></section><footer>RAGNARÖK © 2026 <span>THE NINE REALMS / THE GODS / THE SAGAS</span> ANCIENT STORIES, REIMAGINED</footer>
    </main>
  </>;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap');
:root{--rk-ink:#050505;--rk-charcoal:#0b0d0f;--rk-ivory:#e7e0d2;--rk-silver:#8b9298;--rk-bronze:#8a633e;--rk-line:rgba(231,224,210,.2)}*{box-sizing:border-box}.rk-shell{background:var(--rk-ink);color:var(--rk-ivory);font-family:'Space Grotesk',sans-serif;overflow:hidden}.rk-shell button{font:inherit;color:inherit;cursor:pointer}.rk-nav{height:78px;position:fixed;z-index:20;inset:0 0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(22px,4vw,64px);border-bottom:1px solid var(--rk-line);background:rgba(5,5,5,.72);backdrop-filter:blur(12px)}.rk-brand{display:flex;align-items:center;gap:12px;border:0;background:transparent;font-family:'Cormorant Garamond',serif;font-size:23px;letter-spacing:.24em}.rk-mark{width:29px;height:29px;display:grid;place-items:center;border:1px solid var(--rk-bronze);border-radius:50%;font-size:17px;color:var(--rk-bronze)}.rk-links{display:flex;gap:clamp(18px,3vw,48px);margin-left:auto;margin-right:44px}.rk-links button,.rk-menu{border:0;background:transparent;text-transform:uppercase;letter-spacing:.28em;font-size:11px}.rk-menu{width:38px;height:38px;border:1px solid var(--rk-bronze);border-radius:50%}.rk-hero{min-height:100svh;position:relative;display:grid;place-items:center;padding:120px 5vw 90px;background-position:center;background-size:cover;isolation:isolate}.rk-meta{position:absolute;top:118px;z-index:4;color:var(--rk-silver);font-size:9px;letter-spacing:.2em}.rk-left{left:clamp(22px,4vw,64px)}.rk-right{right:clamp(22px,4vw,64px)}.rk-meta i{display:inline-block;width:4px;height:4px;border:1px solid var(--rk-bronze);transform:rotate(45deg);margin:0 9px}.rk-orbit{position:absolute;width:min(80vw,920px);aspect-ratio:1;border:1px solid rgba(138,99,62,.38);border-radius:50%;display:grid;place-items:start center;padding-top:16px;color:rgba(231,224,210,.3);letter-spacing:.6em;animation:rk-orbit 50s linear infinite}.rk-hero-title{text-align:center;position:relative;z-index:4}.rk-hero-title small,.rk-hero-title p,.rk-section>small,.rk-intro>small,.rk-god-copy>small,.rk-final>small{letter-spacing:.25em;font-size:10px;color:var(--rk-silver);text-transform:uppercase}.rk-hero-title h1,.rk-section h2,.rk-final h2{font-family:'Cormorant Garamond',serif;font-weight:600;letter-spacing:.08em;line-height:.78;margin:0}.rk-hero-title h1{font-size:clamp(86px,17vw,248px)}.rk-hero-title p{letter-spacing:.42em;color:var(--rk-ivory)}.rk-hero-title p span{margin-left:16px;color:var(--rk-silver);letter-spacing:.22em}.rk-thor{position:absolute;z-index:3;bottom:42px;left:50%;transform:translateX(-50%);height:min(78vh,720px);max-width:54vw;object-fit:contain;filter:drop-shadow(0 22px 26px rgba(0,0,0,.7));pointer-events:none}.rk-strip{position:absolute;z-index:2;left:-2%;right:-2%;top:58%;height:72px;display:flex;align-items:center;justify-content:space-evenly;border-top:1px solid var(--rk-bronze);border-bottom:1px solid var(--rk-bronze);background:rgba(5,5,5,.32);transform:rotate(-1deg)}.rk-strip span{width:46px;height:46px;display:grid;place-items:center;border:1px solid var(--rk-bronze);border-radius:50%;font-family:'Cormorant Garamond',serif;font-size:25px}.rk-hero-bottom{position:absolute;z-index:4;left:clamp(22px,4vw,64px);right:clamp(22px,4vw,64px);bottom:72px;display:flex;justify-content:space-between;align-items:end;gap:24px}.rk-hero-bottom strong{font-family:'Cormorant Garamond',serif;font-size:18px;letter-spacing:.16em}.rk-hero-bottom p,.rk-intro p,.rk-god-copy>p,.rk-god-detail p,.rk-saga-line p{color:var(--rk-silver);font-size:12px;line-height:1.7}.rk-actions{display:flex;align-items:center;gap:30px}.rk-button,.rk-text-button{border:1px solid var(--rk-bronze);background:transparent;text-transform:uppercase;letter-spacing:.19em;font-size:10px;padding:16px 20px}.rk-button:hover{background:var(--rk-bronze);color:var(--rk-ink)}.rk-text-button{border:0;border-bottom:1px solid var(--rk-bronze);padding:8px 0}.rk-scroll{position:absolute;z-index:4;bottom:24px;border:0;background:transparent;text-transform:uppercase;letter-spacing:.25em;font-size:9px;color:var(--rk-silver);display:grid;gap:7px;place-items:center}.rk-section{position:relative;padding:clamp(96px,12vw,170px) clamp(22px,7vw,110px);border-top:1px solid rgba(138,99,62,.14)}.rk-section h2,.rk-final h2{font-size:clamp(66px,9vw,138px);margin:28px 0}.rk-section em{font-style:normal}.rk-realms{min-height:900px;display:grid;grid-template-columns:minmax(260px,.8fr) minmax(540px,1.5fr);gap:4vw;background:transparent}.rk-intro{padding-top:40px}.rk-intro p{max-width:320px;line-height:1.9;margin-bottom:32px}.rk-atlas{min-height:700px;position:relative;display:grid;place-items:center}.rk-atlas:before{content:"";position:absolute;width:72%;aspect-ratio:1;border:1px solid rgba(138,99,62,.55);border-radius:50%;box-shadow:0 0 0 28px rgba(138,99,62,.03),0 0 0 52px rgba(138,99,62,.06)}.rk-tree{position:absolute;inset:4% 12%;background:url('./assets/ragnarok-yggdrasil-bg.webp') center/cover;opacity:.35;filter:grayscale(1);mask-image:radial-gradient(circle,#000 25%,transparent 75%)}.rk-realm{position:absolute;z-index:2;display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:transparent;color:var(--rk-silver);text-align:center}.rk-realm b{display:grid;place-items:center;width:43px;height:43px;border:1px solid var(--rk-bronze);border-radius:50%;color:var(--rk-bronze);font-size:20px;margin-bottom:6px}.rk-realm strong{font-family:'Cormorant Garamond',serif;font-size:16px;letter-spacing:.14em}.rk-realm small{font-size:8px;text-transform:uppercase;letter-spacing:.16em}.rk-realm em{max-width:130px;color:var(--rk-bronze);font-size:10px;margin-top:7px;font-style:normal;line-height:1.4}.rk-active{color:var(--rk-ivory);transform:scale(1.08)}.rk-active b{background:var(--rk-bronze);color:var(--rk-ink)}.rk-r0{top:3%;left:50%;transform:translateX(-50%)}.rk-r1{top:18%;left:10%}.rk-r2{top:18%;right:10%}.rk-r3{top:42%;left:50%;transform:translateX(-50%)}.rk-r4{top:43%;left:1%}.rk-r5{top:43%;right:1%}.rk-r6{bottom:13%;left:13%}.rk-r7{bottom:13%;right:13%}.rk-r8{bottom:2%;left:50%;transform:translateX(-50%)}.rk-gods{display:grid;grid-template-columns:minmax(280px,1fr) minmax(300px,1fr);align-items:center;gap:9vw;background:transparent}.rk-odin{position:relative;min-height:600px;display:grid;place-items:end center;overflow:hidden;border:1px solid rgba(138,99,62,.28);background:radial-gradient(circle at 50% 40%,rgba(138,99,62,.26),transparent 55%);box-shadow:inset 0 0 0 8px rgba(138,99,62,.035),inset 0 0 90px rgba(0,0,0,.8)}.rk-odin img{height:620px;max-width:100%;object-fit:contain}.rk-odin span{position:absolute;z-index:2;left:22px;top:20px;color:var(--rk-bronze);font-size:9px;letter-spacing:.2em}.rk-god-copy>p{max-width:330px;line-height:1.9;margin-bottom:32px}.rk-selector{display:flex;flex-wrap:wrap;gap:18px;padding:22px 0;border-top:1px solid var(--rk-line);border-bottom:1px solid var(--rk-line)}.rk-selector button{border:0;background:transparent;color:var(--rk-silver);font-size:10px;letter-spacing:.18em}.rk-selected,.rk-selector button:hover{color:var(--rk-ivory)!important}.rk-god-detail{padding-top:34px}.rk-god-detail h3{font-family:'Cormorant Garamond',serif;font-size:56px;line-height:.9;letter-spacing:.12em;margin:8px 0 20px}.rk-sagas{background:transparent}.rk-sagas>small,.rk-sagas>h2,.rk-artifacts>small,.rk-artifacts>h2,.rk-runes>small,.rk-runes>h2{text-align:center;display:block}.rk-saga-line{margin-top:96px;display:grid;grid-template-columns:repeat(6,1fr);position:relative}.rk-saga-line:before{content:"";position:absolute;top:35px;left:0;right:0;height:1px;background:var(--rk-bronze)}.rk-saga-line article{position:relative;padding:0 14px;text-align:center}.rk-saga-line b{display:block;font-family:'Cormorant Garamond',serif;font-size:35px;margin-bottom:24px}.rk-saga-line i{width:16px;height:16px;display:block;position:relative;z-index:1;margin:0 auto 22px;border:1px solid var(--rk-bronze);border-radius:50%;background:var(--rk-ink)}.rk-saga-line h3{min-height:44px;font-size:11px;line-height:1.5;letter-spacing:.16em}.rk-artifacts{background:transparent}.rk-artifact-plate{margin-top:55px;min-height:260px;border-top:1px solid var(--rk-line);border-bottom:1px solid var(--rk-line);display:grid;place-items:center;text-align:center;background:radial-gradient(circle,rgba(138,99,62,.08),transparent 60%)}.rk-artifact-ghost{font-family:'Cormorant Garamond',serif;font-size:50px;letter-spacing:.3em;color:rgba(138,99,62,.55)}.rk-artifact-plate p{color:var(--rk-bronze);letter-spacing:.18em;font-size:10px}.rk-runes{background:transparent}.rk-translator{max-width:1100px;margin:55px auto 0;border:1px solid rgba(138,99,62,.68);padding:32px;display:grid;grid-template-columns:1fr 48px 1fr 150px;align-items:center;gap:16px}.rk-translator label{color:var(--rk-silver);text-transform:uppercase;letter-spacing:.2em;font-size:9px}.rk-translator input,.rk-translator>div{display:block;margin-top:9px;width:100%;height:64px;border:1px solid rgba(138,99,62,.55);background:rgba(5,5,5,.55);color:var(--rk-ivory);padding:0 22px;letter-spacing:.32em;text-transform:uppercase;outline:none}.rk-translator>div{display:flex;flex-direction:column;justify-content:center;gap:6px}.rk-translator>div label{margin:0}.rk-translator strong{font-family:'Cormorant Garamond',serif;font-size:25px;letter-spacing:.18em;white-space:nowrap;overflow:hidden}.rk-arrow{color:var(--rk-bronze);font-size:22px;text-align:center}.rk-final{text-align:center;padding:150px 22px;background:radial-gradient(circle at 50% 30%,rgba(138,99,62,.17),transparent 44%);border-top:1px solid var(--rk-line)}.rk-final h2{font-size:clamp(86px,15vw,220px)}.rk-shell footer{display:flex;justify-content:space-between;gap:20px;padding:24px clamp(22px,4vw,64px);border-top:1px solid var(--rk-line);color:var(--rk-silver);font-size:9px;letter-spacing:.18em;text-transform:uppercase}@keyframes rk-orbit{to{transform:rotate(348deg)}}@media(max-width:900px){.rk-links{display:none;position:absolute;top:78px;left:0;right:0;padding:28px 24px;background:rgba(5,5,5,.96);border-bottom:1px solid var(--rk-line);flex-direction:column;align-items:flex-start}.rk-open{display:flex}.rk-right{display:none}.rk-realms,.rk-gods{grid-template-columns:1fr}.rk-atlas{min-height:640px}.rk-saga-line{grid-template-columns:repeat(3,1fr);gap:38px}.rk-saga-line:before{display:none}.rk-saga-line article{border-top:1px solid var(--rk-bronze);padding-top:16px}.rk-translator{grid-template-columns:1fr}.rk-arrow{transform:rotate(90deg)}.rk-odin{min-height:470px}.rk-odin img{height:500px}}@media(max-width:560px){.rk-nav{height:66px}.rk-brand{font-size:18px}.rk-hero{padding-top:100px}.rk-meta{top:92px;font-size:7px}.rk-hero-title h1{font-size:22vw}.rk-thor{height:52vh;bottom:110px}.rk-strip{top:52%;height:54px}.rk-strip span{width:29px;height:29px;font-size:14px}.rk-hero-bottom{bottom:36px;flex-direction:column;align-items:flex-start}.rk-actions{width:100%;justify-content:space-between;gap:12px}.rk-button{padding:14px 12px;font-size:8px}.rk-text-button{font-size:8px}.rk-section{padding:88px 22px}.rk-atlas{transform:scale(.82);margin:-50px -10%}.rk-realm strong{font-size:12px}.rk-realm small{font-size:7px}.rk-saga-line{grid-template-columns:1fr 1fr;gap:24px}.rk-artifact-ghost{font-size:23px}.rk-translator{padding:25px 18px}.rk-translator strong{font-size:19px}.rk-final{padding:110px 22px}.rk-final h2{font-size:23vw}.rk-shell footer{flex-direction:column;line-height:1.6}}
  
.rk-shell {
  position: relative;
}

.rk-fixed-yggdrasil {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.rk-shell{--rk-mx:0px;--rk-my:0px;--rk-scroll-y:0px;--rk-tilt-x:0deg;--rk-tilt-y:0deg;--rk-glow-x:50%;--rk-glow-y:50%;background:radial-gradient(circle at 50% calc(15% + var(--rk-scroll-y) * .02),rgba(138,99,62,.07),transparent 32%),var(--rk-ink)}
.rk-nav{transition:background .7s cubic-bezier(.22,1,.36,1),border-color .7s,box-shadow .7s,transform .7s}.rk-nav-scrolled{background:rgba(5,5,5,.9);border-bottom-color:rgba(138,99,62,.42);box-shadow:0 14px 42px rgba(0,0,0,.28)}
.rk-links button,.rk-brand,.rk-menu,.rk-button,.rk-text-button,.rk-scroll,.rk-realm,.rk-selector button{transition:color .45s,background-color .45s,border-color .45s,transform .45s,opacity .45s}.rk-links button{position:relative}.rk-links button:after{content:"";position:absolute;left:0;right:0;bottom:-9px;height:1px;background:var(--rk-bronze);transform:scaleX(0);transform-origin:right;transition:transform .5s cubic-bezier(.22,1,.36,1)}.rk-links button:hover:after,.rk-links button.rk-nav-active:after{transform:scaleX(1);transform-origin:left}.rk-links button.rk-nav-active{color:var(--rk-ivory)}.rk-button:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(138,99,62,.2)}.rk-button:active,.rk-text-button:active,.rk-menu:active{transform:translateY(1px) scale(.98)}.rk-menu:hover,.rk-brand:hover .rk-mark{box-shadow:0 0 0 5px rgba(138,99,62,.09),0 0 22px rgba(138,99,62,.24)}
.rk-hero{--rk-mx:0px;--rk-my:0px;overflow:hidden}.rk-hero:after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.055) 49%,transparent 54%);transform:translateX(-100%);animation:rk-sheen 14s 4s ease-in-out infinite}.rk-aurora{position:absolute;inset:-20%;z-index:0;background:radial-gradient(ellipse at 50% 35%,rgba(138,99,62,.16),transparent 42%),radial-gradient(ellipse at 20% 70%,rgba(80,100,110,.1),transparent 35%);filter:blur(22px);animation:rk-breathe 12s ease-in-out infinite}.rk-lightning{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(112deg,transparent 0 47%,rgba(231,224,210,.16) 48%,transparent 49%);opacity:0;animation:rk-flash 17s 5s infinite}.rk-particles{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.rk-particles i{--size:calc(2px + (var(--i) % 3) * 1px);position:absolute;left:calc((var(--i) * 17) % 100 * 1%);top:calc((var(--i) * 29) % 100 * 1%);width:var(--size);height:var(--size);border-radius:50%;background:rgba(231,224,210,.48);box-shadow:0 0 12px rgba(231,224,210,.45);animation:rk-drift calc(10s + var(--i) * .7s) ease-in-out infinite alternate;animation-delay:calc(var(--i) * -.8s)}.rk-hero-title{transform:translate3d(var(--rk-mx),var(--rk-my),0);animation:rk-rise 1.2s .15s both cubic-bezier(.22,1,.36,1)}.rk-thor{transform:translate3d(calc(-50% + var(--rk-mx) * .58),var(--rk-my),0);animation:rk-thor-in 1.4s .32s both cubic-bezier(.22,1,.36,1),rk-thor-float 8s 1.8s ease-in-out infinite}.rk-orbit{animation:rk-orbit 50s linear infinite,rk-orbit-in 1.5s both}.rk-strip{animation:rk-strip-in 1.2s .4s both cubic-bezier(.22,1,.36,1),rk-strip-drift 18s 2s ease-in-out infinite alternate}.rk-hero-bottom,.rk-meta,.rk-scroll{animation:rk-fade-up 1s .8s both cubic-bezier(.22,1,.36,1)}
.rk-section,.rk-final{opacity:0;transform:translateY(32px);transition:opacity 1s cubic-bezier(.22,1,.36,1),transform 1s cubic-bezier(.22,1,.36,1)}.rk-section:target,.rk-section.rk-visible,.rk-final.rk-visible{opacity:1;transform:none}.rk-section:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(100deg,transparent,rgba(138,99,62,.05),transparent);opacity:.45}.rk-realm{animation:rk-node-float 7s calc(var(--node-delay,0s)) ease-in-out infinite}.rk-realm:nth-of-type(2n){--node-delay:-2s}.rk-realm:hover{transform:translateY(-6px) scale(1.05);color:var(--rk-ivory)}.rk-r0:hover,.rk-r3:hover,.rk-r8:hover{transform:translateX(-50%) translateY(-6px) scale(1.05)}.rk-realm b{transition:box-shadow .5s,background .5s,transform .5s}.rk-realm:hover b,.rk-active b{box-shadow:0 0 0 6px rgba(138,99,62,.08),0 0 28px rgba(138,99,62,.5);transform:rotate(45deg)}.rk-realm:hover b{background:rgba(138,99,62,.32);color:var(--rk-ivory)}.rk-realm em{animation:rk-reveal .55s both cubic-bezier(.22,1,.36,1)}
.rk-odin{transition:box-shadow .8s,border-color .8s}.rk-odin:hover{border-color:rgba(138,99,62,.7);box-shadow:inset 0 0 0 8px rgba(138,99,62,.06),inset 0 0 90px rgba(0,0,0,.8),0 0 44px rgba(138,99,62,.12)}.rk-odin img{transition:transform 1.1s cubic-bezier(.22,1,.36,1),filter 1.1s}.rk-odin:hover img{transform:scale(1.035) translateY(-8px);filter:drop-shadow(0 22px 26px rgba(138,99,62,.2))}.rk-god-detail{animation:rk-reveal .65s both}.rk-selector button{position:relative}.rk-selector button:after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:1px;background:var(--rk-bronze);transform:scaleX(0);transition:transform .45s}.rk-selector button:hover:after,.rk-selector button.rk-selected:after{transform:scaleX(1)}
.rk-saga-line:before{transform:scaleX(.08);transform-origin:left;transition:transform 1.8s cubic-bezier(.22,1,.36,1)}.rk-sagas.rk-visible .rk-saga-line:before{transform:scaleX(1)}.rk-saga-line article{opacity:0;transform:translateY(20px);transition:opacity .75s,transform .75s}.rk-sagas.rk-visible .rk-saga-line article{opacity:1;transform:none}.rk-sagas.rk-visible .rk-saga-line article:nth-child(1){transition-delay:.12s}.rk-sagas.rk-visible .rk-saga-line article:nth-child(2){transition-delay:.22s}.rk-sagas.rk-visible .rk-saga-line article:nth-child(3){transition-delay:.32s}.rk-sagas.rk-visible .rk-saga-line article:nth-child(4){transition-delay:.42s}.rk-sagas.rk-visible .rk-saga-line article:nth-child(5){transition-delay:.52s}.rk-sagas.rk-visible .rk-saga-line article:nth-child(6){transition-delay:.62s}.rk-saga-line i{transition:box-shadow .6s,background .6s}.rk-sagas.rk-visible .rk-saga-line i{box-shadow:0 0 0 5px rgba(138,99,62,.08),0 0 20px rgba(138,99,62,.48);background:var(--rk-bronze)}
.rk-artifact-plate{transform:perspective(1000px) rotateX(var(--rk-tilt-x)) rotateY(var(--rk-tilt-y));transition:transform .18s ease-out,box-shadow .6s;background:radial-gradient(circle at var(--rk-glow-x) var(--rk-glow-y),rgba(138,99,62,.2),transparent 38%),radial-gradient(circle,rgba(138,99,62,.08),transparent 60%)}.rk-artifact-plate:hover{box-shadow:0 20px 55px rgba(0,0,0,.28),inset 0 0 70px rgba(138,99,62,.12)}.rk-artifact-ghost{animation:rk-metal 8s ease-in-out infinite}
.rk-translator{transition:border-color .6s,box-shadow .6s,transform .6s}.rk-translator:focus-within{border-color:var(--rk-bronze);box-shadow:0 0 0 5px rgba(138,99,62,.07),0 16px 44px rgba(0,0,0,.25);transform:translateY(-3px)}.rk-translator input:focus{border-color:var(--rk-bronze);box-shadow:inset 0 0 24px rgba(138,99,62,.1)}.rk-rune-output span{display:inline-block;animation:rk-rune-in .6s both cubic-bezier(.22,1,.36,1);animation-delay:calc(var(--rune-index,0) * 35ms)}.rk-rune-output span:nth-child(1){--rune-index:1}.rk-rune-output span:nth-child(2){--rune-index:2}.rk-rune-output span:nth-child(3){--rune-index:3}.rk-rune-output span:nth-child(4){--rune-index:4}.rk-rune-output span:nth-child(5){--rune-index:5}.rk-rune-output span:nth-child(6){--rune-index:6}.rk-rune-output span:nth-child(7){--rune-index:7}.rk-rune-output span:nth-child(8){--rune-index:8}.rk-rune-output span:nth-child(9){--rune-index:9}.rk-rune-output span:nth-child(10){--rune-index:10}.rk-rune-output span:nth-child(11){--rune-index:11}.rk-rune-output span:nth-child(12){--rune-index:12}.rk-final{position:relative;overflow:hidden}.rk-final:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 110%,rgba(174,35,16,.35),transparent 42%),repeating-radial-gradient(ellipse at 50% 100%,rgba(138,99,62,.08) 0 2px,transparent 3px 18px);animation:rk-embers 9s ease-in-out infinite}.rk-final>*{position:relative}.rk-final h2{animation:rk-final-pulse 7s ease-in-out infinite}.rk-shell footer{position:relative}
@keyframes rk-rise{from{opacity:0;transform:translate3d(var(--rk-mx),calc(var(--rk-my) + 22px),0);letter-spacing:.22em}to{opacity:1;transform:translate3d(var(--rk-mx),var(--rk-my),0);letter-spacing:.08em}}@keyframes rk-thor-in{from{opacity:0;transform:translate3d(calc(-50% + var(--rk-mx) * .58),40px,0)}to{opacity:1;transform:translate3d(calc(-50% + var(--rk-mx) * .58),var(--rk-my),0)}}@keyframes rk-thor-float{50%{transform:translate3d(calc(-50% + var(--rk-mx) * .58),-9px,0)}}@keyframes rk-fade-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes rk-orbit-in{from{opacity:0;transform:scale(.92) rotate(-10deg)}to{opacity:1;transform:scale(1) rotate(0)}}@keyframes rk-strip-in{from{opacity:0;transform:translateY(22px) rotate(-1deg)}to{opacity:1;transform:translateY(0) rotate(-1deg)}}@keyframes rk-strip-drift{to{transform:translateX(-2.5%) rotate(-1deg)}}@keyframes rk-breathe{50%{transform:scale(1.06);opacity:.7}}@keyframes rk-flash{0%,92%,100%{opacity:0}93%{opacity:.8}94%{opacity:0}95%{opacity:.35}96%{opacity:0}}@keyframes rk-drift{to{transform:translate3d(18px,-28px,0);opacity:.12}}@keyframes rk-node-float{50%{translate:0 -5px}}@keyframes rk-reveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes rk-metal{50%{color:rgba(231,224,210,.68);text-shadow:0 0 22px rgba(138,99,62,.35)}}@keyframes rk-rune-in{from{opacity:0;transform:translateY(10px) rotate(7deg);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}@keyframes rk-embers{50%{opacity:.75;transform:scale(1.08)}}@keyframes rk-final-pulse{50%{text-shadow:0 0 40px rgba(174,35,16,.2)}}@keyframes rk-sheen{0%,76%{transform:translateX(-100%)}84%,100%{transform:translateX(100%)}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}.rk-section,.rk-final{opacity:1;transform:none}.rk-hero-title,.rk-thor{animation:none!important;transform:none}.rk-artifact-plate{transform:none!important}}
  `;
