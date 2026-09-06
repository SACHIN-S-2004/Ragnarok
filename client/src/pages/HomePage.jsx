import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------
   RAGNARÖK — a digital atlas of Norse mythology
   Single-file React landing page. No external component/CSS files.
   Includes three.js WebGL scenes for the hero, the Yggdrasil map,
   and the Ragnarök ember field.
------------------------------------------------------------------- */

const REALMS = [
  { id: "asgard", name: "ASGARD", tag: "Realm of the Æsir", people: "Odin · Thor · Frigg · Heimdall", x: 50, y: 12, z: 1.6 },
  { id: "vanaheim", name: "VANAHEIM", tag: "Realm of the Vanir", people: "Freyja · Freyr · Njörðr", x: 20, y: 24, z: -0.6 },
  { id: "alfheim", name: "ALFHEIM", tag: "Realm of the light elves", people: "Freyr's dwelling", x: 78, y: 24, z: -0.6 },
  { id: "midgard", name: "MIDGARD", tag: "Realm of humankind", people: "Bound by the serpent Jörmungandr", x: 50, y: 46, z: 0 },
  { id: "jotunheim", name: "JÖTUNHEIM", tag: "Realm of the giants", people: "Skaði · Útgarða-Loki", x: 84, y: 50, z: 1.1 },
  { id: "svartalfheim", name: "SVARTALFHEIM", tag: "Realm of the dwarves", people: "Forge of Mjölnir and Gungnir", x: 16, y: 52, z: 1.1 },
  { id: "muspelheim", name: "MUSPELHEIM", tag: "Realm of primordial fire", people: "Surtr, who ends the world in flame", x: 68, y: 70, z: -1.1 },
  { id: "niflheim", name: "NIFLHEIM", tag: "Realm of primordial ice", people: "Source of the eleven rivers", x: 32, y: 70, z: -1.1 },
  { id: "hel", name: "HEL", tag: "Realm of the dishonored dead", people: "Ruled by Loki's daughter, Hel", x: 50, y: 88, z: -1.8 },
];

const GODS = [
  { id: "odin", name: "ODIN", title: "The Allfather", traits: ["Wisdom", "War", "Death", "Knowledge"], rune: "ᚨ ᛟ ᚾ" },
  { id: "thor", name: "THOR", title: "Warder of Midgard", traits: ["Strength", "Storms", "Protection"], rune: "ᚦ ᚢ ᚱ" },
  { id: "freyja", name: "FREYJA", title: "Lady of the Vanir", traits: ["Love", "War", "Seiðr"], rune: "ᚠ ᚱ ᛃ" },
  { id: "loki", name: "LOKI", title: "The Trickster", traits: ["Cunning", "Chaos", "Change"], rune: "ᛚ ᛟ ᚲ" },
  { id: "heimdall", name: "HEIMDALL", title: "Watchman of Bifröst", traits: ["Vigilance", "Sight", "Sound"], rune: "ᚺ ᛖ ᛗ" },
  { id: "tyr", name: "TÝR", title: "God of Law", traits: ["Justice", "Sacrifice", "Courage"], rune: "ᛏ ᚤ ᚱ" },
  { id: "frigg", name: "FRIGG", title: "Queen of Asgard", traits: ["Foresight", "Motherhood", "Fate"], rune: "ᚠ ᚱ ᛁ" },
  { id: "baldr", name: "BALDR", title: "The Radiant One", traits: ["Light", "Beauty", "Grief"], rune: "ᛒ ᚨ ᛚ" },
];

const SAGAS = [
  { n: "01", title: "ODIN'S SACRIFICE", body: "For wisdom, the Allfather gave what no ordinary god would surrender — an eye at Mímir's well, and nine nights hanging from Yggdrasil." },
  { n: "02", title: "THOR & JÖRMUNGANDR", body: "On Hymir's boat, Thor hauled the World Serpent from the deep — a rivalry that would not end until the final battle." },
  { n: "03", title: "THE BINDING OF FENRIR", body: "The wolf grew too strong to trust. The gods bound him with a ribbon spun from things that do not exist — at Týr's cost." },
  { n: "04", title: "BALDR'S DEATH", body: "The most beloved of the gods fell to a dart of mistletoe, guided by Loki's hand. Even Hel would not release him." },
  { n: "05", title: "THE ÆSIR–VANIR WAR", body: "The first war the world ever knew, fought between two families of gods, ended not in conquest but in a truce of hostages." },
  { n: "06", title: "RAGNARÖK", body: "The fate the Norns wove from the beginning — when the bound break free, and the world burns to be born again." },
];

const ARTIFACTS = [
  { id: "mjolnir", name: "MJÖLNIR", owner: "Thor's hammer", desc: "Forged by the dwarf brothers Sindri and Brokkr, its handle cut short by Loki's meddling." },
  { id: "gungnir", name: "GUNGNIR", owner: "Odin's spear", desc: "A spear that never misses its mark, inscribed with oaths sworn upon its point." },
  { id: "draupnir", name: "DRAUPNIR", owner: "Odin's ring", desc: "Every ninth night, eight rings of equal weight drip from it — a wellspring of gold." },
  { id: "brisingamen", name: "BRÍSINGAMEN", owner: "Freyja's necklace", desc: "Won from four dwarven smiths at a price the sagas only hint at." },
  { id: "gjallarhorn", name: "GJALLARHORN", owner: "Heimdall's horn", desc: "Kept at the root of Yggdrasil, silent until the day it must announce the end." },
];

const RUNES = [
  { glyph: "ᚠ", name: "FEHU", meaning: "Wealth, cattle, mobile fortune" },
  { glyph: "ᚢ", name: "URUZ", meaning: "The wild ox, raw strength" },
  { glyph: "ᚦ", name: "THURISAZ", meaning: "The giant, a thorn, defended force" },
  { glyph: "ᚨ", name: "ANSUZ", meaning: "A god, breath, the spoken word" },
  { glyph: "ᚱ", name: "RAIDHO", meaning: "The journey, the wheel, right order" },
  { glyph: "ᚲ", name: "KAUNAN", meaning: "The torch, controlled fire" },
];

const RUNE_MAP = {
  a: "ᚨ", b: "ᛒ", c: "ᚲ", d: "ᛞ", e: "ᛖ", f: "ᚠ", g: "ᚷ", h: "ᚺ", i: "ᛁ",
  j: "ᛃ", k: "ᚲ", l: "ᛚ", m: "ᛗ", n: "ᚾ", o: "ᛟ", p: "ᛈ", q: "ᚲ", r: "ᚱ",
  s: "ᛊ", t: "ᛏ", u: "ᚢ", v: "ᚹ", w: "ᚹ", x: "ᚲᛊ", y: "ᛃ", z: "ᛉ", " ": " ",
};

const RAGNAROK_STAGES = [
  "FIMBULWINTER", "LOKI BREAKS FREE", "FENRIR RISES", "JÖRMUNGANDR EMERGES",
  "HEIMDALL SOUNDS GJALLARHORN", "THE GODS RIDE TO WAR", "THE WORLD BURNS", "THE WORLD IS RENEWED",
];

const NAV_ITEMS = [
  { id: "realms", label: "REALMS" },
  { id: "gods", label: "GODS" },
  { id: "sagas", label: "SAGAS" },
  { id: "runes", label: "RUNES" },
  { id: "ragnarok", label: "RAGNARÖK" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler);
    };
  }, []);
  return reduced;
}

function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return touch;
}

/* Reveals a ref'd element when it scrolls into view, once. */
function useReveal(ref, threshold = 0.2) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function Reveal({ children, className = "", threshold, as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  const visible = useReveal(ref, threshold);
  return (
    <Tag ref={ref} className={`reveal ${visible ? "reveal--in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------
   THREE.JS — shared helpers
------------------------------------------------------------------- */

/* A soft radial-gradient sprite texture, reused across every particle
   and glow in the scene so we never allocate more than one canvas. */
function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.5)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* Recursively grows a branching line structure — used as the hero's
   procedural Yggdrasil silhouette instead of a flat illustration. */
function buildTreeVertices() {
  const verts = [];
  const tmpEnd = new THREE.Vector3();
  function branch(origin, dir, length, depth) {
    if (depth <= 0 || length < 0.28) return;
    tmpEnd.copy(dir).multiplyScalar(length).add(origin);
    const end = tmpEnd.clone();
    verts.push(origin.x, origin.y, origin.z, end.x, end.y, end.z);
    const count = depth > 3 ? 2 : Math.random() > 0.45 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const spread = 0.5 + Math.random() * 0.45;
      const newDir = dir.clone();
      newDir.x += (Math.random() - 0.5) * spread;
      newDir.y += 0.18 + Math.random() * 0.22;
      newDir.z += (Math.random() - 0.5) * spread * 0.6;
      newDir.normalize();
      branch(end, newDir, length * 0.72, depth - 1);
    }
  }
  branch(new THREE.Vector3(0, -7.5, -3), new THREE.Vector3(0, 1, 0), 3, 7);
  return new Float32Array(verts);
}

/* ------------------------------------------------------------------
   HeroScene — cosmic starfield, drifting dust, and a procedurally
   grown Yggdrasil silhouette that answers to mouse parallax.
------------------------------------------------------------------- */
function HeroScene({ reducedMotion, parallax }) {
  const mountRef = useRef(null);
  const parallaxRef = useRef(parallax);
  parallaxRef.current = parallax;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let width = mount.clientWidth || 1;
    let height = mount.clientHeight || 1;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 13);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const glowTex = createGlowTexture();

    // starfield
    const starCount = 700;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 42;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 6;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.085, map: glowTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0x9aa3aa, opacity: 0.75,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // drifting dust motes
    const duskCount = 130;
    const duskPos = new Float32Array(duskCount * 3);
    const duskSpeed = new Float32Array(duskCount);
    for (let i = 0; i < duskCount; i++) {
      duskPos[i * 3] = (Math.random() - 0.5) * 17;
      duskPos[i * 3 + 1] = (Math.random() - 0.5) * 11 - 2;
      duskPos[i * 3 + 2] = (Math.random() - 0.5) * 9 + 3;
      duskSpeed[i] = 0.14 + Math.random() * 0.3;
    }
    const duskGeo = new THREE.BufferGeometry();
    duskGeo.setAttribute("position", new THREE.BufferAttribute(duskPos, 3));
    const duskMat = new THREE.PointsMaterial({
      size: 0.05, map: glowTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0xc9bfa8, opacity: 0.5,
    });
    const dusk = new THREE.Points(duskGeo, duskMat);
    scene.add(dusk);

    // procedural Yggdrasil silhouette
    const treeGeo = new THREE.BufferGeometry();
    treeGeo.setAttribute("position", new THREE.BufferAttribute(buildTreeVertices(), 3));
    const treeMat = new THREE.LineBasicMaterial({ color: 0x6fa8b8, transparent: true, opacity: 0.22 });
    const tree = new THREE.LineSegments(treeGeo, treeMat);
    scene.add(tree);

    const clock = new THREE.Clock();
    let raf = null;

    const renderFrame = () => {
      const dt = clock.getDelta();
      const t = clock.elapsedTime;
      if (!reducedMotion) {
        stars.rotation.y += dt * 0.006;
        const arr = dusk.geometry.attributes.position.array;
        for (let i = 0; i < duskCount; i++) {
          arr[i * 3 + 1] += duskSpeed[i] * dt;
          if (arr[i * 3 + 1] > 9) arr[i * 3 + 1] = -9;
        }
        dusk.geometry.attributes.position.needsUpdate = true;
        tree.rotation.y = Math.sin(t * 0.05) * 0.05 + parallaxRef.current.x * 0.12;
        tree.rotation.x = parallaxRef.current.y * 0.06;
        camera.position.x += (parallaxRef.current.x * 0.7 - camera.position.x) * 0.03;
        camera.position.y += (0.4 - parallaxRef.current.y * 0.5 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
      if (!reducedMotion) raf = requestAnimationFrame(renderFrame);
    };
    renderFrame();

    const onResize = () => {
      width = mount.clientWidth || 1;
      height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose();
      starGeo.dispose(); starMat.dispose();
      duskGeo.dispose(); duskMat.dispose();
      treeGeo.dispose(); treeMat.dispose();
      glowTex.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return <div ref={mountRef} className="three-hero-canvas" aria-hidden="true" />;
}

/* ------------------------------------------------------------------
   YggdrasilScene — the nine realms rendered as a 3D constellation
   around Midgard, raycast-picked on hover/click, with live labels
   projected from world space onto the DOM.
------------------------------------------------------------------- */
function YggdrasilScene({ realms, activeRealm, onHover, onSelect, reducedMotion, isTouch }) {
  const mountRef = useRef(null);
  const labelRefs = useRef({});
  const activeRef = useRef(activeRealm);

  useEffect(() => {
    activeRef.current = activeRealm;
  }, [activeRealm]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let width = mount.clientWidth || 1;
    let height = mount.clientHeight || 1;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 11.5);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const glowTex = createGlowTexture();
    const group = new THREE.Group();
    scene.add(group);

    const mapPos = (r) => new THREE.Vector3(
      (r.x / 100 - 0.5) * 9.2,
      -(r.y / 100 - 0.5) * 9.2 + 1.3,
      r.z || 0
    );

    const hubPos = mapPos(realms.find((r) => r.id === "midgard"));
    const nodes = {};
    const lines = {};
    const sphereGeo = new THREE.SphereGeometry(0.15, 20, 20);

    realms.forEach((r) => {
      const pos = mapPos(r);
      const isHub = r.id === "midgard";

      if (!isHub) {
        const geo = new THREE.BufferGeometry().setFromPoints([hubPos, pos]);
        const mat = new THREE.LineBasicMaterial({ color: 0x9aa3aa, transparent: true, opacity: 0.32 });
        const line = new THREE.Line(geo, mat);
        group.add(line);
        lines[r.id] = line;
      }

      const mesh = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: isHub ? 0xc9bfa8 : 0x6b7379 }));
      mesh.position.copy(pos);
      mesh.userData.id = r.id;
      group.add(mesh);

      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: 0x6fa8b8, transparent: true, opacity: 0.45,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      sprite.scale.set(0.85, 0.85, 1);
      sprite.position.copy(pos);
      group.add(sprite);

      nodes[r.id] = { mesh, sprite, base: pos.clone(), phase: Math.random() * Math.PI * 2 };
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    let hoveredId = null;

    const setHovered = (id) => {
      if (id === hoveredId) return;
      hoveredId = id;
      mount.toggleAttribute("data-cursor-hover", !!id);
      onHover(id);
    };

    const onPointerMove = (e) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onPointerLeave = () => {
      pointer.x = -10; pointer.y = -10;
      setHovered(null);
    };
    const onClick = (e) => {
      const rect = mount.getBoundingClientRect();
      const tapPointer = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(tapPointer, camera);
      const hit = raycaster.intersectObjects(Object.values(nodes).map((n) => n.mesh));
      if (hit.length) onSelect(hit[0].object.userData.id);
    };

    if (!isTouch) {
      mount.addEventListener("pointermove", onPointerMove);
      mount.addEventListener("pointerleave", onPointerLeave);
    }
    mount.addEventListener("click", onClick);

    const clock = new THREE.Clock();
    let raf = null;

    const renderFrame = () => {
      clock.getDelta();
      const t = clock.elapsedTime;

      Object.values(nodes).forEach(({ mesh, sprite, base, phase }) => {
        const floatY = reducedMotion ? 0 : Math.sin(t * 0.6 + phase) * 0.08;
        mesh.position.y = base.y + floatY;
        sprite.position.y = mesh.position.y;
      });

      if (!reducedMotion) group.rotation.y = Math.sin(t * 0.06) * 0.05;

      if (!isTouch) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(Object.values(nodes).map((n) => n.mesh));
        setHovered(hit.length ? hit[0].object.userData.id : null);
      }

      Object.entries(nodes).forEach(([id, { sprite }]) => {
        const isActive = id === activeRef.current;
        const targetScale = isActive ? 1.7 : 0.85;
        sprite.scale.x += (targetScale - sprite.scale.x) * 0.15;
        sprite.scale.y += (targetScale - sprite.scale.y) * 0.15;
        sprite.material.opacity += ((isActive ? 0.85 : 0.4) - sprite.material.opacity) * 0.15;
      });
      Object.entries(lines).forEach(([id, line]) => {
        const isActive = id === activeRef.current;
        line.material.opacity += ((isActive ? 0.85 : 0.28) - line.material.opacity) * 0.15;
        line.material.color.setHex(isActive ? 0x6fa8b8 : 0x9aa3aa);
      });

      Object.entries(nodes).forEach(([id, { mesh }]) => {
        const label = labelRefs.current[id];
        if (!label) return;
        const v = mesh.position.clone().project(camera);
        const x = (v.x * 0.5 + 0.5) * width;
        const y = (-v.y * 0.5 + 0.5) * height;
        label.style.transform = `translate(${x}px, ${y}px) translate(-50%, 14px)`;
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(renderFrame);
    };
    renderFrame();

    const onResize = () => {
      width = mount.clientWidth || 1;
      height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (!isTouch) {
        mount.removeEventListener("pointermove", onPointerMove);
        mount.removeEventListener("pointerleave", onPointerLeave);
      }
      mount.removeEventListener("click", onClick);
      if (raf) cancelAnimationFrame(raf);
      sphereGeo.dispose();
      glowTex.dispose();
      Object.values(lines).forEach((l) => { l.geometry.dispose(); l.material.dispose(); });
      Object.values(nodes).forEach((n) => { n.mesh.material.dispose(); n.sprite.material.dispose(); });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realms, reducedMotion, isTouch]);

  return (
    <div ref={mountRef} className="ygg-3d-mount" data-cursor-hover>
      {realms.map((r) => (
        <div
          key={r.id}
          ref={(el) => { labelRefs.current[r.id] = el; }}
          className={`realm-label-3d ${activeRealm === r.id ? "active" : ""}`}
        >
          {r.name}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   ParticleField3D — a small reusable rising-particle scene, used for
   the Ragnarök ember field.
------------------------------------------------------------------- */
function ParticleField3D({ count = 90, color = 0xc4622d, size = 0.05, riseHeight = 9, spread = { x: 14, y: 9, z: 6 }, speedRange = [0.4, 1], opacity = 0.75, reducedMotion, className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let width = mount.clientWidth || 1;
    let height = mount.clientHeight || 1;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 60);
    camera.position.set(0, 0, 10);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const glowTex = createGlowTexture();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread.x;
      positions[i * 3 + 1] = Math.random() * riseHeight - riseHeight / 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z;
      speeds[i] = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size, map: glowTex, color, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const clock = new THREE.Clock();
    let raf = null;

    const renderFrame = () => {
      const dt = clock.getDelta();
      if (!reducedMotion) {
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          arr[i * 3 + 1] += speeds[i] * dt;
          arr[i * 3] += Math.sin(clock.elapsedTime * 0.6 + i) * dt * 0.05;
          if (arr[i * 3 + 1] > riseHeight / 2) arr[i * 3 + 1] = -riseHeight / 2;
        }
        geo.attributes.position.needsUpdate = true;
      }
      renderer.render(scene, camera);
      if (!reducedMotion) raf = requestAnimationFrame(renderFrame);
    };
    renderFrame();

    const onResize = () => {
      width = mount.clientWidth || 1;
      height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      geo.dispose(); mat.dispose(); glowTex.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [count, color, size, riseHeight, spread.x, spread.y, spread.z, speedRange[0], speedRange[1], opacity, reducedMotion]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}

export default function Ragnarok() {
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouch();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorActive, setCursorActive] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [activeRealm, setActiveRealm] = useState(null);
  const [activeGod, setActiveGod] = useState(null);
  const [runeWord, setRuneWord] = useState("");
  const sectionRefs = useRef({});
  const rafRef = useRef(null);

  /* Scroll tracking: navbar state, active section, progress bar */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(max > 0 ? y / max : 0);

      let current = "hero";
      let closest = Infinity;
      Object.entries(sectionRefs.current).forEach(([id, el]) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - 120);
        if (rect.top < window.innerHeight * 0.6 && dist < closest) {
          closest = dist;
          current = id;
        }
      });
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Mouse parallax + custom cursor, single rAF loop, cleaned up on unmount */
  useEffect(() => {
    if (isTouch) return;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    const onMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setCursorActive(!!(el && el.closest("[data-cursor-hover]")));
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      setParallax({ x: current.x, y: current.y });
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    if (!reducedMotion) rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch, reducedMotion]);

  const registerSection = useCallback((id) => (el) => {
    sectionRefs.current[id] = el;
  }, []);

  const scrollTo = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, [reducedMotion]);

  const runeTransliteration = runeWord
    .toLowerCase()
    .split("")
    .map((ch) => RUNE_MAP[ch] || "")
    .join(" ");

  const activeRealmData = REALMS.find((r) => r.id === activeRealm);

  return (
    <div className={`rag-root ${isTouch ? "is-touch" : ""}`}>
      <style>{`
        .rag-root {
          --void: #07090B;
          --deep: #0D1114;
          --panel: #111619;
          --parchment: #C9BFA8;
          --silver: #9AA3AA;
          --stone: #4B5259;
          --bronze: #8A5A34;
          --ember: #C4622D;
          --ice: #6FA8B8;
          --gold: #B08D3E;
          --line: rgba(201, 191, 168, 0.14);
          --font-display: 'Cinzel', 'Times New Roman', serif;
          --font-body: 'EB Garamond', Georgia, serif;
          --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--void);
          color: var(--parchment);
          font-family: var(--font-ui);
          position: relative;
          overflow-x: hidden;
          isolation: isolate;
          cursor: ${isTouch ? "auto" : "none"};
        }

        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');

        .rag-root * { box-sizing: border-box; }
        .rag-root a { color: inherit; text-decoration: none; }
        .rag-root button { font-family: inherit; }

        .rag-root ::selection { background: var(--ember); color: var(--void); }

        /* ---------- grain + vignette (shared atmosphere) ---------- */
        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 60;
          opacity: 0.05; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .vignette {
          position: fixed; inset: 0; pointer-events: none; z-index: 59;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%);
        }
        .scroll-progress {
          position: fixed; top: 0; left: 0; height: 2px; z-index: 100;
          background: linear-gradient(90deg, var(--bronze), var(--ember));
          transition: width 0.1s linear;
        }

        /* ---------- custom cursor ---------- */
        .cursor-dot, .cursor-ring {
          position: fixed; top: 0; left: 0; pointer-events: none; z-index: 200;
          border-radius: 50%; transform: translate(-50%, -50%);
        }
        .cursor-dot { width: 5px; height: 5px; background: var(--parchment); }
        .cursor-ring {
          width: 34px; height: 34px; border: 1px solid rgba(201,191,168,0.5);
          transition: width 0.25s ease, height 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .cursor-ring.active { width: 56px; height: 56px; border-color: var(--ember); background: rgba(196,98,45,0.08); }

        /* ---------- navbar ---------- */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 90;
          display: flex; align-items: center; justify-content: space-between;
          padding: 26px 5vw; transition: background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease, padding 0.4s ease;
          border-bottom: 1px solid transparent;
        }
        .navbar.scrolled {
          background: rgba(7,9,11,0.78); backdrop-filter: blur(10px);
          border-bottom-color: var(--line); padding: 16px 5vw;
        }
        .navbar-mark { font-family: var(--font-display); letter-spacing: 0.08em; font-size: 1.05rem; }
        .navbar-mark .rune { color: var(--ember); margin-right: 0.5em; }
        .navbar-links { display: flex; gap: 2.4rem; }
        .navbar-links button {
          background: none; border: none; color: var(--silver); font-size: 0.72rem;
          letter-spacing: 0.16em; padding: 4px 0; cursor: pointer; position: relative;
          transition: color 0.3s ease;
        }
        .navbar-links button::after {
          content: ""; position: absolute; left: 0; bottom: -4px; height: 1px; width: 0;
          background: var(--ember); transition: width 0.35s ease;
        }
        .navbar-links button.active { color: var(--parchment); }
        .navbar-links button.active::after, .navbar-links button:hover::after { width: 100%; }
        .navbar-links { }
        .navbar-orb {
          width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line);
          display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.02);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .navbar-orb:hover { border-color: var(--ember); box-shadow: 0 0 14px rgba(196,98,45,0.35); }

        /* ---------- hero ---------- */
        .hero {
          position: relative; min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center; overflow: hidden;
          background:
            radial-gradient(ellipse 70% 50% at 50% 20%, rgba(111,168,184,0.06), transparent 60%),
            radial-gradient(ellipse 90% 60% at 50% 100%, rgba(138,90,52,0.10), transparent 70%),
            var(--void);
        }
        .three-hero-canvas { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .hero-fog { position: absolute; inset: -10%; pointer-events: none; z-index: 2; }
        .fog-layer {
          position: absolute; inset: 0; opacity: 0.35; filter: blur(30px);
          background: linear-gradient(90deg, transparent, rgba(111,168,184,0.08), transparent 70%);
        }
        .fog-layer.f1 { animation: driftFog 60s linear infinite; }
        .fog-layer.f2 { animation: driftFog 90s linear infinite reverse; top: 20%; opacity: 0.22; }
        .fog-layer.f3 { animation: driftFog 120s linear infinite; top: 55%; opacity: 0.18; }
        @keyframes driftFog { from { transform: translateX(-15%); } to { transform: translateX(15%); } }

        .rune-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
        .rune-flicker {
          position: absolute; font-family: var(--font-display); color: var(--ice);
          opacity: 0; animation: runeFlicker 9s ease-in-out infinite;
          pointer-events: none; user-select: none;
        }
        @keyframes runeFlicker {
          0%, 100% { opacity: 0; }
          8%, 22% { opacity: 0.35; }
          30% { opacity: 0; }
        }

        .light-ray {
          position: absolute; top: -20%; width: 2px; height: 140%;
          background: linear-gradient(180deg, transparent, rgba(111,168,184,0.12), transparent);
          transform: rotate(12deg); animation: raySweep 18s linear infinite; pointer-events: none;
        }
        @keyframes raySweep { from { left: -10%; } to { left: 110%; } }

        .hero-content { position: relative; z-index: 5; padding: 0 6vw; }
        .eyebrow {
          font-size: 0.72rem; letter-spacing: 0.35em; color: var(--ice); margin-bottom: 1.6rem;
          font-family: var(--font-ui);
        }
        .eyebrow .rune { color: var(--bronze); margin: 0 0.6em; }
        .hero-title {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(3.6rem, 12vw, 9rem); line-height: 0.92; letter-spacing: 0.01em;
          color: var(--parchment);
          text-shadow: 0 0 60px rgba(111,168,184,0.15), 0 4px 30px rgba(0,0,0,0.6);
        }
        .hero-kicker {
          margin-top: 1.4rem; font-family: var(--font-ui); font-size: 0.82rem;
          letter-spacing: 0.32em; color: var(--gold);
        }
        .hero-sub {
          margin: 1.6rem auto 0; max-width: 34rem; font-family: var(--font-body); font-style: italic;
          font-size: 1.2rem; color: var(--silver); line-height: 1.6;
        }
        .hero-ctas { margin-top: 3rem; display: flex; gap: 1.4rem; justify-content: center; flex-wrap: wrap; }

        .btn {
          position: relative; padding: 0.95rem 2.2rem; font-size: 0.75rem; letter-spacing: 0.2em;
          border-radius: 2px; cursor: pointer; font-family: var(--font-ui); font-weight: 500;
          transition: transform 0.35s ease, box-shadow 0.35s ease, background 0.35s ease, color 0.35s ease, border-color 0.35s ease;
          will-change: transform;
        }
        .btn-primary { background: var(--parchment); color: var(--void); border: 1px solid var(--parchment); }
        .btn-primary:hover { box-shadow: 0 0 30px rgba(201,191,168,0.25); transform: translateY(-2px); }
        .btn-ghost { background: transparent; color: var(--parchment); border: 1px solid var(--line); }
        .btn-ghost:hover { border-color: var(--ember); color: var(--ember); transform: translateY(-2px); }

        .scroll-indicator {
          position: absolute; bottom: 2.6rem; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 0.7rem; z-index: 5;
        }
        .scroll-indicator span { font-size: 0.62rem; letter-spacing: 0.3em; color: var(--stone); }
        .scroll-line { width: 1px; height: 46px; background: linear-gradient(180deg, var(--parchment), transparent); position: relative; overflow: hidden; }
        .scroll-line::after {
          content: ""; position: absolute; left: 0; top: -100%; width: 100%; height: 100%;
          background: linear-gradient(180deg, transparent, var(--ember), transparent);
          animation: scrollDrip 2.4s ease-in-out infinite;
        }
        @keyframes scrollDrip { to { top: 200%; } }

        /* vertical rune timeline */
        .rune-rail {
          position: fixed; right: 2.2rem; top: 50%; transform: translateY(-50%); z-index: 40;
          display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
        }
        .rune-rail .r-glyph {
          font-family: var(--font-display); font-size: 1rem; color: var(--stone);
          transition: color 0.4s ease, transform 0.4s ease; cursor: pointer;
        }
        .rune-rail .r-glyph.active { color: var(--ember); transform: scale(1.5); }
        .rune-rail .r-line { width: 1px; height: 16px; background: var(--line); }

        /* ---------- shared section chrome ---------- */
        .section { position: relative; padding: 9rem 6vw; }
        .section-head { max-width: 44rem; margin: 0 auto 4.5rem; text-align: center; }
        .section-eyebrow { font-size: 0.72rem; letter-spacing: 0.3em; color: var(--ice); margin-bottom: 1rem; }
        .section-title {
          font-family: var(--font-display); font-weight: 600; font-size: clamp(2.2rem, 5vw, 3.6rem);
          color: var(--parchment); line-height: 1.05;
        }
        .section-sub { margin-top: 1rem; font-family: var(--font-body); font-style: italic; color: var(--silver); font-size: 1.1rem; }

        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.9s ease, transform 0.9s ease; }
        .reveal--in { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal { transition: none; opacity: 1; transform: none; }
        }

        /* ---------- yggdrasil / realms (three.js) ---------- */
        .yggdrasil-wrap { position: relative; max-width: 900px; margin: 0 auto; aspect-ratio: 1/1.05; }
        .ygg-3d-mount { position: absolute; inset: 0; }
        .ygg-3d-mount canvas { width: 100% !important; height: 100% !important; display: block; }
        .realm-label-3d {
          position: absolute; left: 0; top: 0; pointer-events: none; white-space: nowrap;
          font-size: 0.62rem; letter-spacing: 0.14em; color: var(--silver);
          transition: color 0.3s ease; will-change: transform;
        }
        .realm-label-3d.active { color: var(--parchment); }

        .realm-panel {
          margin: 3rem auto 0; max-width: 30rem; text-align: center; min-height: 6.5rem;
        }
        .realm-panel .rp-name { font-family: var(--font-display); font-size: 1.7rem; color: var(--gold); }
        .realm-panel .rp-tag { font-family: var(--font-body); font-style: italic; color: var(--silver); margin-top: 0.4rem; }
        .realm-panel .rp-people { font-size: 0.72rem; letter-spacing: 0.1em; color: var(--stone); margin-top: 0.8rem; }
        .realm-hint { text-align: center; color: var(--stone); font-size: 0.78rem; letter-spacing: 0.08em; }

        /* ---------- gods ---------- */
        .gods-rail { display: flex; overflow-x: auto; gap: 1px; scrollbar-width: none; background: var(--line); }
        .gods-rail::-webkit-scrollbar { display: none; }
        .god-panel {
          position: relative; flex: 1 0 auto; width: 15vw; min-width: 140px; height: 62vh;
          background: linear-gradient(180deg, var(--deep), var(--void));
          display: flex; align-items: flex-end; padding: 1.6rem 1.2rem; cursor: pointer;
          transition: flex-basis 0.6s cubic-bezier(0.22,1,0.36,1), width 0.6s cubic-bezier(0.22,1,0.36,1), background 0.6s ease;
          overflow: hidden;
        }
        .god-panel::before {
          content: ""; position: absolute; inset: 0; opacity: 0.5;
          background: radial-gradient(circle at 50% 120%, rgba(196,98,45,0.16), transparent 60%);
          transition: opacity 0.6s ease;
        }
        .god-panel.expanded { width: 34vw; background: linear-gradient(180deg, #161b1f, var(--void)); }
        .god-panel.expanded::before { opacity: 0.9; }
        .god-inner { position: relative; z-index: 2; width: 100%; }
        .god-name {
          font-family: var(--font-display); color: var(--parchment); letter-spacing: 0.04em;
          font-size: 1.1rem; writing-mode: vertical-rl; text-orientation: mixed;
          transition: font-size 0.5s ease, writing-mode 0.1s;
        }
        .god-panel.expanded .god-name { writing-mode: horizontal-tb; font-size: clamp(2.2rem, 4vw, 3.4rem); }
        .god-meta { max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.5s ease, opacity 0.5s ease 0.1s; margin-top: 0.8rem; }
        .god-panel.expanded .god-meta { max-height: 12rem; opacity: 1; }
        .god-title { font-family: var(--font-body); font-style: italic; color: var(--ice); font-size: 1rem; }
        .god-traits { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-top: 0.7rem; }
        .god-traits span { font-size: 0.68rem; letter-spacing: 0.1em; color: var(--silver); }
        .god-rune { margin-top: 1rem; font-family: var(--font-display); color: var(--bronze); letter-spacing: 0.3em; font-size: 0.9rem; }

        /* ---------- sagas ---------- */
        .saga-line { position: relative; max-width: 46rem; margin: 0 auto; }
        .saga-line::before {
          content: ""; position: absolute; left: 1.1rem; top: 0; bottom: 0; width: 1px; background: var(--line);
        }
        .saga-item { position: relative; padding: 0 0 4rem 3.6rem; }
        .saga-item:last-child { padding-bottom: 0; }
        .saga-num {
          position: absolute; left: 0; top: -0.2rem; font-family: var(--font-display); font-size: 0.95rem;
          color: var(--bronze); width: 2.2rem; text-align: center; background: var(--void);
        }
        .saga-title { font-family: var(--font-display); font-size: 1.5rem; color: var(--parchment); margin-bottom: 0.7rem; }
        .saga-body { font-family: var(--font-body); color: var(--silver); line-height: 1.7; max-width: 34rem; }
        .saga-cta {
          display: inline-block; margin-top: 1rem; font-size: 0.68rem; letter-spacing: 0.18em; color: var(--ice);
          border-bottom: 1px solid transparent; transition: border-color 0.3s ease, color 0.3s ease; cursor: pointer;
        }
        .saga-cta:hover { border-color: var(--ice); color: var(--parchment); }

        /* ---------- artifacts ---------- */
        .artifact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 3rem 2rem; max-width: 70rem; margin: 0 auto; }
        .artifact-card { text-align: center; padding: 2.4rem 1rem; }
        .artifact-glyph {
          width: 70px; height: 70px; margin: 0 auto 1.6rem; border: 1px solid var(--line); border-radius: 50%;
          display: flex; align-items: center; justify-content: center; position: relative;
          animation: floatSlow 7s ease-in-out infinite;
        }
        .artifact-glyph::after { content: ""; position: absolute; inset: -10px; border: 1px solid var(--line); border-radius: 50%; opacity: 0.4; animation: spinSlow 22s linear infinite; }
        .artifact-glyph span { font-family: var(--font-display); font-size: 1.5rem; color: var(--gold); }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        .artifact-name { font-family: var(--font-display); font-size: 1.3rem; letter-spacing: 0.04em; color: var(--parchment); }
        .artifact-owner { font-size: 0.7rem; letter-spacing: 0.1em; color: var(--bronze); margin: 0.5rem 0 1rem; }
        .artifact-desc { font-family: var(--font-body); color: var(--silver); font-size: 0.95rem; line-height: 1.6; }

        /* ---------- runes ---------- */
        .rune-row { display: flex; justify-content: center; flex-wrap: wrap; gap: 2.2rem; margin-bottom: 4.5rem; }
        .rune-tile { text-align: center; cursor: pointer; padding: 1rem 0.6rem; width: 108px; }
        .rune-glyph { font-family: var(--font-display); font-size: 3rem; color: var(--stone); transition: color 0.4s ease, transform 0.4s ease, text-shadow 0.4s ease; }
        .rune-tile:hover .rune-glyph { color: var(--ice); transform: scale(1.15); text-shadow: 0 0 22px rgba(111,168,184,0.4); }
        .rune-name { margin-top: 0.7rem; font-size: 0.68rem; letter-spacing: 0.14em; color: var(--silver); }
        .rune-meaning { margin-top: 0.4rem; font-size: 0.68rem; color: var(--stone); font-family: var(--font-body); font-style: italic; min-height: 2rem; opacity: 0; transition: opacity 0.4s ease; }
        .rune-tile:hover .rune-meaning { opacity: 1; }

        .rune-lab { max-width: 34rem; margin: 0 auto; text-align: center; }
        .rune-lab label { display: block; font-size: 0.68rem; letter-spacing: 0.2em; color: var(--ice); margin-bottom: 1rem; }
        .rune-lab input {
          width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--line);
          color: var(--parchment); font-family: var(--font-ui); font-size: 1.1rem; padding: 0.7rem 0.2rem;
          text-align: center; letter-spacing: 0.05em; outline: none; transition: border-color 0.3s ease;
        }
        .rune-lab input:focus { border-color: var(--ember); }
        .rune-output { margin-top: 1.8rem; font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.3em; color: var(--gold); min-height: 3rem; word-break: break-all; }
        .rune-disclaimer { margin-top: 1.4rem; font-size: 0.66rem; color: var(--stone); letter-spacing: 0.04em; }

        /* ---------- ragnarok ---------- */
        .ragnarok-section {
          background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(196,98,45,0.10), transparent 65%), var(--void);
          position: relative; overflow: hidden;
        }
        .ember-canvas { position: absolute; inset: 0; pointer-events: none; }
        .ember-canvas canvas { width: 100% !important; height: 100% !important; display: block; }

        .rag-timeline { max-width: 26rem; margin: 0 auto; text-align: center; }
        .rag-stage { font-family: var(--font-display); font-size: 1.15rem; letter-spacing: 0.08em; color: var(--stone); padding: 1rem 0; transition: color 0.6s ease, transform 0.6s ease; }
        .rag-stage.lit { color: var(--ember); transform: scale(1.06); }
        .rag-arrow { color: var(--stone); font-size: 0.9rem; }

        .rag-finale { text-align: center; padding-top: 6rem; }
        .rag-finale-line { font-family: var(--font-display); font-size: clamp(1.4rem, 3.4vw, 2.2rem); color: var(--parchment); letter-spacing: 0.03em; }
        .rag-finale-glow { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); margin: 2.4rem auto 0; box-shadow: 0 0 40px 10px rgba(176,141,62,0.5); animation: pulseGlow 3.4s ease-in-out infinite; }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

        /* ---------- final cta ---------- */
        .final-cta { text-align: center; padding: 10rem 6vw; }
        .final-cta h2 { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.2rem); color: var(--parchment); }
        .final-cta .sub { font-family: var(--font-body); font-style: italic; color: var(--silver); margin-top: 1rem; }
        .final-links { display: flex; justify-content: center; gap: 2.4rem; flex-wrap: wrap; margin-top: 3rem; }
        .final-links span { font-size: 0.72rem; letter-spacing: 0.12em; color: var(--bronze); cursor: pointer; transition: color 0.3s ease; }
        .final-links span:hover { color: var(--ember); }

        /* ---------- footer ---------- */
        .footer { border-top: 1px solid var(--line); padding: 3.4rem 6vw; }
        .footer-inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 2rem; max-width: 80rem; margin: 0 auto; }
        .footer-brand { font-family: var(--font-display); letter-spacing: 0.08em; color: var(--parchment); }
        .footer-tag { font-size: 0.68rem; letter-spacing: 0.12em; color: var(--stone); margin-top: 0.5rem; }
        .footer-links { display: flex; gap: 1.6rem; flex-wrap: wrap; }
        .footer-links span { font-size: 0.68rem; letter-spacing: 0.1em; color: var(--silver); cursor: pointer; }
        .footer-links span:hover { color: var(--ember); }
        .footer-note { margin-top: 2.2rem; font-size: 0.66rem; color: var(--stone); font-family: var(--font-body); font-style: italic; text-align: center; }

        /* ---------- responsive ---------- */
        @media (max-width: 860px) {
          .rag-root { cursor: auto; }
          .rune-rail { display: none; }
          .navbar-links { display: none; }
          .section { padding: 6rem 6vw; }
          .gods-rail { flex-direction: column; overflow-x: visible; }
          .god-panel { width: 100% !important; height: 20rem; align-items: flex-start; padding-top: 1.6rem; }
          .god-name { writing-mode: horizontal-tb !important; font-size: 1.8rem !important; }
          .god-meta { max-height: none !important; opacity: 1 !important; }
          .yggdrasil-wrap { aspect-ratio: 1/1.3; }
          .realm-label-3d { font-size: 0.55rem; }
        }
      `}</style>

      {!isTouch && (
        <>
          <div className="cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />
          <div className={`cursor-ring ${cursorActive ? "active" : ""}`} style={{ left: cursorPos.x, top: cursorPos.y }} />
        </>
      )}
      <div className="grain" />
      <div className="vignette" />
      <div className="scroll-progress" style={{ width: `${scrollProgress * 100}%` }} />

      {!isTouch && (
        <nav className="rune-rail" aria-hidden="true">
          {["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ"].map((g, i) => (
            <React.Fragment key={g}>
              {i > 0 && <div className="r-line" />}
              <span className={`r-glyph ${NAV_ITEMS[i] && activeSection === NAV_ITEMS[i].id ? "active" : ""}`}>{g}</span>
            </React.Fragment>
          ))}
        </nav>
      )}

      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-mark"><span className="rune">ᛏ</span>RAGNARÖK</div>
        <div className="navbar-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              onClick={() => scrollTo(item.id)}
              data-cursor-hover
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="navbar-orb" data-cursor-hover title="Atmosphere">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        </div>
      </nav>

      {/* ---------------- HERO ---------------- */}
      <section className="hero" ref={registerSection("hero")}>
        <div className="hero-fog">
          <div className="fog-layer f1" />
          <div className="fog-layer f2" />
          <div className="fog-layer f3" />
        </div>

        <HeroScene reducedMotion={reducedMotion} parallax={parallax} />

        <div className="rune-overlay" aria-hidden="true">
          {!reducedMotion && (
            <>
              <span className="rune-flicker" style={{ left: "18%", top: "30%", fontSize: "2.4rem", animationDelay: "0s" }}>ᛟ</span>
              <span className="rune-flicker" style={{ left: "76%", top: "22%", fontSize: "1.8rem", animationDelay: "3s" }}>ᛗ</span>
              <span className="rune-flicker" style={{ left: "62%", top: "62%", fontSize: "2.1rem", animationDelay: "6s" }}>ᛉ</span>
              <div className="light-ray" style={{ left: "20%" }} />
              <div className="light-ray" style={{ left: "70%", animationDelay: "9s" }} />
            </>
          )}
        </div>

        <div className="hero-content" style={{ transform: `translate(${parallax.x * -6}px, ${parallax.y * -4}px)` }}>
          <div className="eyebrow"><span className="rune">ᚠ</span>NINE REALMS · ONE WORLD TREE<span className="rune">ᚱ</span></div>
          <h1 className="hero-title">RAGNARÖK</h1>
          <div className="hero-kicker">ENTER THE NINE REALMS</div>
          <p className="hero-sub">Explore the gods. Discover the sagas. Witness the end of the world.</p>
          <div className="hero-ctas">
            <button className="btn btn-primary" data-cursor-hover onClick={() => scrollTo("realms")}>ENTER THE REALMS</button>
            <button className="btn btn-ghost" data-cursor-hover onClick={() => scrollTo("sagas")}>EXPLORE THE SAGAS</button>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>SCROLL TO ENTER</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ---------------- REALMS / YGGDRASIL ---------------- */}
      <section className="section" id="realms" ref={registerSection("realms")}>
        <Reveal className="section-head">
          <div className="section-eyebrow">ᚨ THE COSMIC AXIS ᚨ</div>
          <h2 className="section-title">THE WORLD IS A TREE</h2>
          <p className="section-sub">Nine realms. One cosmic axis. Infinite stories.</p>
        </Reveal>

        <Reveal className="yggdrasil-wrap" threshold={0.1}>
          <YggdrasilScene
            realms={REALMS}
            activeRealm={activeRealm}
            onHover={setActiveRealm}
            onSelect={setActiveRealm}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          />
        </Reveal>

        {activeRealmData ? (
          <div className="realm-panel">
            <div className="rp-name">{activeRealmData.name}</div>
            <div className="rp-tag">{activeRealmData.tag}</div>
            <div className="rp-people">{activeRealmData.people}</div>
          </div>
        ) : (
          <p className="realm-hint">Move across the tree to reveal a realm</p>
        )}
      </section>

      {/* ---------------- GODS ---------------- */}
      <section className="section" id="gods" ref={registerSection("gods")} style={{ padding: "9rem 0" }}>
        <Reveal className="section-head" style={{ padding: "0 6vw" }}>
          <div className="section-eyebrow">ᛏ THE ÆSIR AND VANIR ᛏ</div>
          <h2 className="section-title">MEET THE GODS</h2>
          <p className="section-sub">Eight faces of an ancient pantheon.</p>
        </Reveal>

        <div className="gods-rail">
          {GODS.map((g) => (
            <div
              key={g.id}
              className={`god-panel ${activeGod === g.id ? "expanded" : ""}`}
              onMouseEnter={() => setActiveGod(g.id)}
              onFocus={() => setActiveGod(g.id)}
              onMouseLeave={() => setActiveGod((cur) => (cur === g.id ? null : cur))}
              tabIndex={0}
              data-cursor-hover
            >
              <div className="god-inner">
                <div className="god-name">{g.name}</div>
                <div className="god-meta">
                  <div className="god-title">{g.title}</div>
                  <div className="god-traits">{g.traits.map((t) => <span key={t}>{t}</span>)}</div>
                  <div className="god-rune">{g.rune}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- SAGAS ---------------- */}
      <section className="section" id="sagas" ref={registerSection("sagas")}>
        <Reveal className="section-head">
          <div className="section-eyebrow">ᚱ STORIES CARRIED ACROSS CENTURIES ᚱ</div>
          <h2 className="section-title">THE SAGAS</h2>
          <p className="section-sub">Drawn from the Poetic and Prose Eddas, retold in brief.</p>
        </Reveal>

        <div className="saga-line">
          {SAGAS.map((s) => (
            <Reveal key={s.n} as="div" className="saga-item">
              <div className="saga-num">{s.n}</div>
              <div className="saga-title">{s.title}</div>
              <p className="saga-body">{s.body}</p>
              <div className="saga-cta" data-cursor-hover>ENTER STORY →</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- ARTIFACTS ---------------- */}
      <section className="section">
        <Reveal className="section-head">
          <div className="section-eyebrow">ᚨ RELICS OF THE NINE REALMS ᚨ</div>
          <h2 className="section-title">THE WEAPONS OF THE GODS</h2>
          <p className="section-sub">Objects the sagas remember by name.</p>
        </Reveal>
        <div className="artifact-grid">
          {ARTIFACTS.map((a) => (
            <Reveal key={a.id} className="artifact-card" as="div">
              <div className="artifact-glyph"><span>{a.name[0]}</span></div>
              <div className="artifact-name">{a.name}</div>
              <div className="artifact-owner">{a.owner}</div>
              <p className="artifact-desc">{a.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- RUNES ---------------- */}
      <section className="section" id="runes" ref={registerSection("runes")}>
        <Reveal className="section-head">
          <div className="section-eyebrow">ᚦ THE ELDER FUTHARK ᚦ</div>
          <h2 className="section-title">THE LANGUAGE OF FATE</h2>
          <p className="section-sub">Symbols carved for casting, counting, and remembering.</p>
        </Reveal>

        <Reveal className="rune-row" as="div">
          {RUNES.map((r) => (
            <div className="rune-tile" key={r.name} data-cursor-hover>
              <div className="rune-glyph">{r.glyph}</div>
              <div className="rune-name">{r.name}</div>
              <div className="rune-meaning">{r.meaning}</div>
            </div>
          ))}
        </Reveal>

        <Reveal className="rune-lab" as="div">
          <label htmlFor="rune-word-input">WRITE YOUR WORD</label>
          <input
            id="rune-word-input"
            type="text"
            maxLength={22}
            placeholder="type a word..."
            value={runeWord}
            onChange={(e) => setRuneWord(e.target.value)}
          />
          <div className="rune-output">{runeTransliteration || "᛫ ᛫ ᛫"}</div>
          <p className="rune-disclaimer">A modern, simplified transliteration for exploration — not historically authenticated runic writing.</p>
        </Reveal>
      </section>

      {/* ---------------- RAGNARÖK ---------------- */}
      <section className="section ragnarok-section" id="ragnarok" ref={registerSection("ragnarok")}>
        <ParticleField3D
          className="ember-canvas"
          count={isTouch ? 40 : 90}
          color={0xc4622d}
          size={0.055}
          riseHeight={10}
          spread={{ x: 15, y: 10, z: 6 }}
          speedRange={[0.5, 1.2]}
          opacity={0.8}
          reducedMotion={reducedMotion}
        />

        <Reveal className="section-head">
          <div className="section-eyebrow">ᚾ THE FATE OF THE GODS ᚾ</div>
          <h2 className="section-title" style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)" }}>RAGNARÖK</h2>
          <p className="section-sub">The fate the Norns wove from the beginning.</p>
        </Reveal>

        <Reveal className="rag-timeline" as="div">
          {RAGNAROK_STAGES.map((stage, i) => (
            <React.Fragment key={stage}>
              <div className={`rag-stage ${i === RAGNAROK_STAGES.length - 1 ? "lit" : ""}`}>{stage}</div>
              {i < RAGNAROK_STAGES.length - 1 && <div className="rag-arrow">↓</div>}
            </React.Fragment>
          ))}
        </Reveal>

        <Reveal className="rag-finale" as="div">
          <div className="rag-finale-line">AND YET, THE WORLD RETURNS.</div>
          <div className="rag-finale-glow" />
        </Reveal>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="final-cta">
        <Reveal as="div">
          <h2>THE STORIES SURVIVED.<br />NOW DISCOVER THEM.</h2>
          <p className="sub">A living atlas of the myths that shaped the North.</p>
          <div className="hero-ctas" style={{ marginTop: "2.6rem" }}>
            <button className="btn btn-primary" data-cursor-hover onClick={() => scrollTo("hero")}>ENTER RAGNARÖK</button>
          </div>
          <div className="final-links">
            <span onClick={() => scrollTo("realms")} data-cursor-hover>Explore the realms</span>
            <span onClick={() => scrollTo("gods")} data-cursor-hover>Meet the gods</span>
            <span onClick={() => scrollTo("sagas")} data-cursor-hover>Read the sagas</span>
            <span onClick={() => scrollTo("runes")} data-cursor-hover>Decode the runes</span>
          </div>
        </Reveal>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">RAGNARÖK</div>
            <div className="footer-tag">A DIGITAL ATLAS OF NORSE MYTHOLOGY</div>
          </div>
          <div className="footer-links">
            <span onClick={() => scrollTo("realms")}>REALMS</span>
            <span onClick={() => scrollTo("gods")}>GODS</span>
            <span onClick={() => scrollTo("sagas")}>SAGAS</span>
            <span onClick={() => scrollTo("runes")}>RUNES</span>
            <span>SOURCES</span>
          </div>
        </div>
        <p className="footer-note">Inspired by surviving Old Norse literary traditions and later interpretations.</p>
      </footer>
    </div>
  );
}