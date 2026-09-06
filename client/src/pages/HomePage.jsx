import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePerformanceParallax } from "../hooks/usePerformanceParallax";
import HeroSection from "../components/HeroSection";
import RealmsSection from "../components/RealmsSection";
import GodsSection from "../components/GodsSection";
import SagasSection from "../components/SagasSection";
import RelicsSection from "../components/RelicsSection";
import RuneSection from "../components/RuneSection";
import RagnarokSection from "../components/RagnarokSection";
import "./HomePage.css";

const NAV_ITEMS = [
  { id: "hero", label: "ATLAS" },
  { id: "realms", label: "REALMS" },
  { id: "gods", label: "GODS" },
  { id: "sagas", label: "SAGAS" },
  { id: "runes", label: "RUNES" },
  { id: "ragnarok", label: "RAGNARÖK" },
];

export default function HomePage() {
  const pageRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);

  // High performance rAF parallax hook (zero React state re-renders on mousemove!)
  usePerformanceParallax(pageRef);

  /* Throttled Scroll Listener */
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setScrolled(y > 50);

          const doc = document.documentElement;
          const max = doc.scrollHeight - doc.clientHeight;
          setScrollProgress(max > 0 ? y / max : 0);

          // Calculate active section
          const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
          let current = "hero";
          for (const sec of sections) {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.15) {
              current = sec.id;
              break;
            }
          }
          setActiveSection(current);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="rag-root" ref={pageRef}>
      {/* Hardware-Accelerated Ambient Glows */}
      <div className="rag-bg-glows" aria-hidden="true">
        <div className="bg-aurora" />
        <div className="bg-fire-ember" />
        <div className="bg-cosmic-purple" />
      </div>

      <div className="rag-vignette" />

      {/* Top Scroll Progress Indicator */}
      <div className="rag-scroll-progress" style={{ width: `${scrollProgress * 100}%` }} />

      {/* Custom Cursor (Manipulated via Direct DOM in hook) */}
      <div className="rag-cursor-dot" id="rag-cursor-dot" />
      <div className="rag-cursor-ring" id="rag-cursor-ring" />

      {/* Navigation Header */}
      <header className={`rag-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-brand" onClick={() => scrollTo("hero")} style={{ cursor: "pointer" }}>
          <span className="brand-rune">ᛏ</span>
          <span>RAGNARÖK</span>
        </div>

        <nav className="navbar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-link-btn ${activeSection === item.id ? "active" : ""}`}
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-controls">
          <button className="nav-badge-btn" onClick={() => scrollTo("runes")}>
            <span>ᚦ</span>
            <span>EXPLORE RUNES</span>
          </button>
        </div>
      </header>

      {/* Main Page Sections */}
      <main>
        <HeroSection
          onExploreRealms={() => scrollTo("realms")}
          onExploreSagas={() => scrollTo("sagas")}
        />

        <RealmsSection />

        <GodsSection />

        <SagasSection />

        <RelicsSection />

        <RuneSection />

        <RagnarokSection />
      </main>

      {/* Final Call to Action */}
      <section className="rag-section final-cta-section">
        <div className="section-head" style={{ marginBottom: "2.5rem" }}>
          <div className="section-eyebrow">
            <span className="rune-icon">ᚨ</span> THE SAGAS SURVIVED <span className="rune-icon">ᚨ</span>
          </div>
          <h2 className="section-title">UNCOVER THE MYTHS</h2>
          <p className="section-sub">
            A living digital atlas of the gods, realms, sagas, and prophecies of Norse lore.
          </p>
        </div>

        <div className="hero-ctas" style={{ justifyContent: "center" }}>
          <button className="rag-btn rag-btn-primary" onClick={() => scrollTo("hero")}>
            <span>RETURN TO THE TREE</span>
            <span>↑</span>
          </button>
          <button className="rag-btn rag-btn-ghost" onClick={() => scrollTo("realms")}>
            <span>EXPLORE THE REALMS</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="rag-footer">
        <div className="footer-inner">
          <div>
            <div className="navbar-brand">
              <span className="brand-rune">ᛏ</span>
              <span>RAGNARÖK</span>
            </div>
            <p className="footer-tagline">A DIGITAL ATLAS OF NORSE MYTHOLOGY & EDDAS</p>
          </div>

          <div className="footer-nav">
            {NAV_ITEMS.map((item) => (
              <span key={item.id} onClick={() => scrollTo(item.id)}>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          Inspiring curiosity through ancient lore, Icelandic sagas, and modern digital craft.
        </div>
      </footer>
    </div>
  );
}