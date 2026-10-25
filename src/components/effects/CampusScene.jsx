import { useEffect, useRef, useState } from 'react';
import campusImage from '../../assets/hero-campus.jpg';
import Cloud from './Cloud';

/*
 * Adegan kampus yang "hidup". Gambar asli dilapisi salinan potongan (clip-path)
 * yang digerakkan secara halus: pohon bergoyang, karakter bernapas dan menoleh,
 * rambut tertiup angin, jip bergetar, ditambah awan, bayangan awan, sinar
 * matahari, kilau jendela, dan burung.
 */

const IW = 2576;
const IH = 1441;

const pct = (points) =>
  points.map(([x, y]) => `${((x / IW) * 100).toFixed(2)}% ${((y / IH) * 100).toFixed(2)}%`).join(', ');

function foliageOrigin(points) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const bottom = Math.max(...ys);
  return `${((cx / IW) * 100).toFixed(1)}% ${((bottom / IH) * 100).toFixed(1)}%`;
}

const origin = ([x, y]) => `${((x / IW) * 100).toFixed(1)}% ${((y / IH) * 100).toFixed(1)}%`;

const TREES = [
  {
    id: 'tree-top-right',
    amp: 0.55, dur: 7.5, delay: -1,
    points: [[1965, 0], [2576, 0], [2576, 415], [2480, 420], [2400, 370], [2330, 330], [2260, 270], [2200, 215], [2130, 120], [2050, 90], [1990, 50]],
  },
  {
    id: 'tree-left',
    amp: 0.5, dur: 8.5, delay: -4,
    points: [[0, 430], [60, 420], [130, 470], [200, 530], [260, 600], [290, 690], [290, 780], [260, 860], [180, 880], [100, 930], [0, 1000]],
  },
  {
    id: 'tree-mid-left',
    amp: 0.9, dur: 6.2, delay: -2,
    points: [[220, 1000], [250, 900], [330, 850], [400, 880], [420, 960], [400, 1040], [330, 1120], [250, 1120]],
  },
  {
    id: 'tree-mid',
    amp: 0.9, dur: 6.8, delay: -5,
    points: [[410, 990], [450, 900], [520, 845], [590, 870], [620, 950], [610, 1040], [540, 1120], [450, 1110]],
  },
  {
    id: 'tree-entrance',
    amp: 1.0, dur: 5.8, delay: -3,
    points: [[940, 1010], [1000, 980], [1060, 945], [1140, 960], [1175, 1020], [1150, 1090], [1080, 1140], [990, 1120]],
  },
  {
    id: 'tree-right',
    amp: 0.6, dur: 7.1, delay: -6,
    points: [[1610, 860], [1690, 800], [1760, 760], [1830, 770], [1900, 790], [1990, 800], [2040, 860], [2010, 950], [1930, 1000], [1880, 1040], [1740, 1040], [1680, 980], [1620, 930]],
  },
];

const BODY = [[1520, 1010], [1600, 1015], [1680, 1000], [1715, 1060], [1725, 1150], [1765, 1250], [1795, 1275], [1700, 1290], [1520, 1295], [1500, 1200], [1515, 1100]];
const LEGS = [[1560, 1130], [1470, 1150], [1400, 1200], [1370, 1260], [1305, 1285], [1330, 1305], [1420, 1310], [1520, 1300], [1545, 1200]];
const HEAD = [[1535, 935], [1555, 895], [1610, 885], [1665, 905], [1690, 945], [1680, 985], [1660, 1012], [1600, 1018], [1560, 1000]];
const HAIR = [[1535, 935], [1555, 895], [1610, 885], [1665, 905], [1690, 945], [1650, 940], [1600, 925], [1560, 948]];
const JEEP = [[1900, 1100], [1930, 1010], [2000, 970], [2050, 870], [2100, 850], [2400, 870], [2480, 950], [2500, 1100], [2480, 1200], [2400, 1250], [2200, 1250], [1960, 1190]];

const SKY = [[0, 0], [1960, 0], [1895, 80], [1495, 175], [1495, 330], [1320, 350], [1315, 745], [250, 690], [180, 600], [150, 500], [60, 440], [0, 430]];
const GROUND = [[0, 1140], [700, 1180], [1390, 1190], [1740, 1160], [1900, 1240], [2576, 1230], [2576, 1441], [0, 1441]];

const GLINTS = [
  [1640, 420, 0], [1700, 540, 1.4], [1950, 235, 2.6], [2150, 310, 0.8], [2000, 610, 3.3],
  [2250, 700, 2], [1960, 790, 4], [2330, 430, 1.1], [1500, 640, 3.7], [780, 700, 2.9],
];

function useCover(stageRef) {
  const [box, setBox] = useState(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;

    const calc = () => {
      const sw = el.clientWidth;
      const sh = el.clientHeight;
      // Margin ekstra 48px agar tepi gambar tidak pernah terlihat
      const scale = Math.max((sw + 48) / IW, sh / IH) * 1.06;
      const w = IW * scale;
      const h = IH * scale;
      const left = Math.min(0, Math.max(sw - w, sw * 0.58 - 0.64 * w));
      setBox({ w, h, left, top: sh - h, extra: h - sh });
    };

    calc();
    const observer = new ResizeObserver(calc);
    observer.observe(el);
    window.addEventListener('resize', calc);
    window.addEventListener('load', calc);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calc);
      window.removeEventListener('load', calc);
    };
  }, [stageRef]);

  return box;
}

function Layer({ points, className = '', style }) {
  return (
    <div
      className={`scene-layer ${className}`}
      style={{ clipPath: `polygon(${pct(points)})`, ...style }}
    />
  );
}

export default function CampusScene() {
  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const box = useCover(stageRef);

  // Parallax gulir: pemandangan bergeser sedikit lebih lambat dari halaman
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !box) return undefined;
    let ticking = false;

    const update = () => {
      ticking = false;
      const py = Math.min(window.scrollY * 0.12, box.extra);
      scene.style.setProperty('--py', `${py.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [box]);

  return (
    <div className="scene-stage" ref={stageRef} aria-hidden="true">
      {box && (
        <div
          className="scene"
          ref={sceneRef}
          style={{
            width: box.w,
            height: box.h,
            left: box.left,
            top: box.top,
            '--scene-img': `url(${campusImage})`,
          }}
        >
          <div className="scene-camera">
            <div className="scene-layer scene-base" />

            {TREES.map((tree) => (
              <Layer
                key={tree.id}
                points={tree.points}
                className="scene-sway"
                style={{
                  transformOrigin: foliageOrigin(tree.points),
                  '--amp': tree.amp,
                  animationDuration: `${tree.dur}s`,
                  animationDelay: `${tree.delay}s`,
                }}
              />
            ))}

            <Layer points={JEEP} className="scene-idle" style={{ transformOrigin: origin([2200, 1250]) }} />

            <div className="scene-group scene-breathe" style={{ transformOrigin: origin([1610, 1295]) }}>
              <Layer points={LEGS} />
              <Layer points={BODY} />
            </div>

            <div className="scene-group scene-head" style={{ transformOrigin: origin([1610, 1012]) }}>
              <Layer points={HEAD} />
              <Layer points={HAIR} className="scene-hair" style={{ transformOrigin: origin([1610, 950]) }} />
            </div>

            <div className="scene-sun" />
            <div className="scene-sunrays" />

            <div className="scene-clip" style={{ clipPath: `polygon(${pct(SKY)})` }}>
              <Cloud className="scene-cloud scene-cloud-1" />
              <Cloud className="scene-cloud scene-cloud-2" />
              <Cloud className="scene-cloud scene-cloud-3" />
            </div>

            <div className="scene-clip" style={{ clipPath: `polygon(${pct(GROUND)})` }}>
              <span className="cloud-shadow cloud-shadow-1" />
              <span className="cloud-shadow cloud-shadow-2" />
            </div>

            {GLINTS.map(([x, y, delay], i) => (
              <span
                key={i}
                className="scene-glint"
                style={{
                  left: `${(x / IW) * 100}%`,
                  top: `${(y / IH) * 100}%`,
                  animationDelay: `${delay}s`,
                }}
              />
            ))}

            <svg className="scene-bird scene-bird-1" viewBox="0 0 40 16">
              <path d="M2 12 Q10 0 20 10 Q30 0 38 12" />
            </svg>
            <svg className="scene-bird scene-bird-2" viewBox="0 0 40 16">
              <path d="M2 12 Q10 0 20 10 Q30 0 38 12" />
            </svg>
            <svg className="scene-bird scene-bird-3" viewBox="0 0 40 16">
              <path d="M2 12 Q10 0 20 10 Q30 0 38 12" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
