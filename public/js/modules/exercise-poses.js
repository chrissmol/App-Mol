// Poses ilustradas de execução de exercício, uma por categoria de padrão
// de movimento (ver movementCategory em exercise-presentation.js) — dois
// quadros (início/fim) no mesmo boneco estilizado do mapa muscular
// (mol-muscle-map), pra manter um único padrão visual em vez de fotos
// reais de fontes externas (cada uma com pessoa/ângulo/cor diferentes).
//
// Duas variantes de ângulo, escolhidas por categoria conforme o plano de
// movimento: lateral pra padrões sagitais (empurrar/puxar pra frente,
// dobradiça de quadril), frontal pra padrões que abrem no plano frontal
// (puxada, elevação/desenvolvimento, rosca).
//
// O SVG é injetado como markup inline (nunca como <img src="data:...">):
// as cores usam var(--mol-neon) etc. pra acompanhar o tema, e variáveis
// CSS não atravessam a fronteira de um data URI — só funcionam se o SVG
// estiver de fato no DOM do documento.

import { movementCategory } from './exercise-presentation.js';

const BODY = 'var(--mol-muted)';
const BAR = 'var(--mol-text)';
const BAR_STROKE = 'var(--mol-border)';
const NEON_FILL = 'var(--mol-neon)';
const NEON_STROKE = 'color-mix(in srgb, var(--mol-neon) 60%, black)';
const GLOW_STYLE = 'filter: drop-shadow(0 0 5px color-mix(in srgb, var(--mol-neon) 55%, transparent))';
const GROUND = 'rgba(0,0,0,.35)';

const limb = (d, width, fill = BODY) => `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const hlimb = (d, width) => `<path d="${d}" fill="none" stroke="${NEON_FILL}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" style="${GLOW_STYLE}"/>`;
const joint = (cx, cy, r, fill = BODY) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
const hrect = (x, y, w, h, rx) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${NEON_FILL}" stroke="${NEON_STROKE}" style="${GLOW_STYLE}"/>`;
const hcircle = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${NEON_FILL}" stroke="${NEON_STROKE}" style="${GLOW_STYLE}"/>`;
const plate = (cx, cy) => `<rect x="${cx - 8}" y="${cy - 4.5}" width="16" height="9" rx="3" fill="${BAR}"/><ellipse cx="${cx}" cy="${cy}" rx="11" ry="12" fill="${BAR}" stroke="${BAR_STROKE}" stroke-width="1.5"/><ellipse cx="${cx}" cy="${cy}" rx="5.5" ry="6" fill="${BAR_STROKE}"/>`;
const bar = (x, y, width) => `<rect x="${x}" y="${y}" width="${width}" height="7" rx="3.5" fill="${BAR}"/><circle cx="${x}" cy="${y + 3.5}" r="8" fill="${BAR}" stroke="${BAR_STROKE}"/><circle cx="${x + width}" cy="${y + 3.5}" r="8" fill="${BAR}" stroke="${BAR_STROKE}"/>`;
const groundShadow = (cx, rx, cy = 122) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="${GROUND}"/>`;

// Base deitado (lado): supino e flexora compartilham banco + cabeça à
// direita + tronco horizontal, só o que se move embaixo muda.
function lyingBase(torsoHighlighted) {
  const torso = torsoHighlighted ? hrect(40, 66, 68, 22, 11) : `<rect x="40" y="66" width="68" height="22" rx="11" fill="${BODY}"/>`;
  return `
    ${groundShadow(80, 66)}
    <rect x="18" y="88" width="114" height="8" rx="4" fill="color-mix(in srgb, var(--mol-border) 60%, transparent)"/>
    <rect x="26" y="96" width="10" height="18" rx="3" fill="color-mix(in srgb, var(--mol-border) 40%, transparent)"/>
    <rect x="116" y="96" width="10" height="18" rx="3" fill="color-mix(in srgb, var(--mol-border) 40%, transparent)"/>
    ${torso}
    ${joint(106, 77, 9)}${joint(118, 77, 11)}
  `;
}

// Base em pé, visão de frente: puxada, elevação lateral e rosca
// compartilham cabeça + pernas + tronco, só os braços/destaque mudam.
function standingFrontBase() {
  return `
    ${joint(80, 22, 11)}${joint(80, 35, 6)}
    ${limb('M70,90 Q68,118 66,146', 14)}${limb('M90,90 Q92,118 94,146', 14)}
    <ellipse cx="66" cy="148" rx="9" ry="4" fill="${BODY}"/><ellipse cx="94" cy="148" rx="9" ry="4" fill="${BODY}"/>
    <rect x="62" y="36" width="36" height="54" rx="18" fill="${BODY}"/>
  `;
}

const POSES = {
  supino: {
    view: 'side',
    label: 'Peito em destaque',
    build: () => {
      const body = lyingBase(true);
      const legs = limb('M46,80 Q30,92 20,120', 15);
      return [
        `${body}${legs}${limb('M100,72 Q98,58 96,45', 12)}${plate(96, 42.5)}`,
        `${body}${legs}${limb('M100,72 Q99,42 98,15', 12)}${plate(98, 14.5)}`
      ];
    }
  },
  flexora: {
    view: 'side',
    label: 'Posterior de coxa em destaque',
    build: () => {
      const body = lyingBase(false);
      const arms = `${limb('M100,72 Q92,56 84,44', 11)}${joint(84, 44, 6, BAR)}`;
      const thigh = hlimb('M46,80 Q30,90 18,100', 15);
      return [
        `${body}${arms}${thigh}${hlimb('M18,100 Q26,112 34,122', 13)}`,
        `${body}${arms}${thigh}${hlimb('M18,100 Q4,92 -4,78', 13)}`
      ];
    }
  },
  agachamento: {
    view: 'side',
    label: 'Quadríceps em destaque',
    build: () => [
      `${groundShadow(80, 44)}${joint(80, 24, 10)}${joint(80, 36, 7)}<rect x="68" y="36" width="24" height="44" rx="12" fill="${BODY}"/>${limb('M68,40 Q48,36 30,33', 11)}${limb('M92,40 Q112,36 130,33', 11)}${bar(30, 30, 100)}${hlimb('M72,80 Q66,100 64,116', 16)}${hlimb('M88,80 Q94,100 96,116', 16)}<ellipse cx="64" cy="118" rx="9" ry="4" fill="${BODY}"/><ellipse cx="96" cy="118" rx="9" ry="4" fill="${BODY}"/>`,
      `${groundShadow(80, 44)}${joint(80, 42, 10)}${joint(80, 54, 7)}<rect x="66" y="54" width="28" height="30" rx="14" fill="${BODY}"/>${limb('M66,58 Q46,54 30,51', 11)}${limb('M94,58 Q114,54 130,51', 11)}${bar(30, 48, 100)}${hlimb('M72,84 Q56,92 60,116', 16)}${hlimb('M88,84 Q104,92 100,116', 16)}<ellipse cx="60" cy="118" rx="9" ry="4" fill="${BODY}"/><ellipse cx="100" cy="118" rx="9" ry="4" fill="${BODY}"/>`
    ]
  },
  extensora: {
    view: 'side',
    label: 'Quadríceps em destaque',
    build: () => {
      const seat = `<rect x="30" y="86" width="46" height="10" rx="4" fill="color-mix(in srgb, var(--mol-border) 55%, transparent)"/><rect x="34" y="96" width="8" height="24" rx="3" fill="color-mix(in srgb, var(--mol-border) 40%, transparent)"/>`;
      const torso = `${joint(56, 44, 10)}${joint(56, 56, 7)}<rect x="46" y="56" width="22" height="32" rx="11" fill="${BODY}"/>${limb('M50,60 Q38,66 30,76', 10)}`;
      const thigh = hrect(52, 82, 34, 15, 7.5);
      return [
        `${groundShadow(70, 56)}${seat}${torso}${thigh}${limb('M84,89 Q86,104 82,118', 12)}${joint(82, 118, 5)}`,
        `${groundShadow(70, 56)}${seat}${torso}${thigh}${limb('M84,89 Q108,90 124,84', 12)}${joint(124, 84, 5)}`
      ];
    }
  },
  pelvica: {
    view: 'side',
    label: 'Glúteo em destaque',
    build: () => {
      const bench = `<rect x="16" y="70" width="34" height="9" rx="4" fill="color-mix(in srgb, var(--mol-border) 55%, transparent)"/><rect x="20" y="79" width="8" height="18" rx="3" fill="color-mix(in srgb, var(--mol-border) 40%, transparent)"/>`;
      const head = `${joint(24, 62, 9)}${joint(36, 66, 7)}`;
      const arm = limb('M30,68 Q20,80 14,92', 8);
      const shin = `${limb('M84,92 Q88,108 86,120', 13)}${joint(86, 120, 6)}`;
      return [
        `${groundShadow(70, 56)}${bench}${head}${arm}${limb('M40,68 Q66,78 84,100', 22)}${hlimb('M84,96 Q68,104 52,98', 17)}${shin}`,
        `${groundShadow(70, 56)}${bench}${head}${arm}${limb('M40,68 Q70,66 96,72', 22)}${hlimb('M96,70 Q78,80 60,80', 17)}${limb('M96,68 Q92,96 86,120', 13)}${joint(86, 120, 6)}`
      ];
    }
  },
  remada: {
    view: 'side',
    label: 'Costas em destaque',
    build: () => {
      const seat = `<rect x="52" y="92" width="14" height="26" rx="5" fill="color-mix(in srgb, var(--mol-border) 40%, transparent)"/>`;
      const legs = limb('M60,88 Q76,96 96,100', 13);
      const head = `${joint(48, 44, 9)}${joint(50, 56, 7)}`;
      const torsoBack = hrect(40, 56, 24, 36, 12);
      return [
        `${groundShadow(70, 56)}${seat}${legs}${head}${torsoBack}${limb('M56,64 Q84,64 108,66', 11)}${joint(108, 66, 6, BAR)}`,
        `${groundShadow(70, 56)}${seat}${legs}${head}${torsoBack}${limb('M56,68 Q40,70 26,72', 11)}${joint(26, 72, 6, BAR)}`
      ];
    }
  },
  triceps: {
    view: 'side',
    label: 'Tríceps em destaque',
    build: () => {
      const legs = `${limb('M66,92 Q64,108 62,122', 13)}${limb('M78,92 Q80,108 82,122', 13)}`;
      const torso = `${joint(72, 40, 10)}${joint(72, 52, 7)}<rect x="60" y="52" width="24" height="42" rx="12" fill="${BODY}"/>`;
      const upperArm = hrect(82, 58, 13, 30, 6.5);
      return [
        `${groundShadow(72, 40)}${legs}${torso}${upperArm}${limb('M92,86 Q98,72 96,56', 9)}${joint(96, 54, 5, BAR)}`,
        `${groundShadow(72, 40)}${legs}${torso}${upperArm}${limb('M92,86 Q100,96 104,110', 9)}${joint(105, 112, 5, BAR)}`
      ];
    }
  },
  generic: {
    view: 'side',
    label: 'Movimento geral',
    build: () => {
      const torso = `${joint(74, 40, 10)}${joint(74, 52, 7)}<rect x="62" y="52" width="24" height="42" rx="12" fill="${BODY}"/>`;
      return [
        `${groundShadow(74, 40)}${limb('M68,92 Q66,108 64,122', 13)}${limb('M80,92 Q82,108 84,122', 13)}${torso}${limb('M86,58 Q92,72 90,86', 10)}${joint(90, 88, 6, BAR)}`,
        `${groundShadow(74, 40)}${limb('M68,92 Q60,106 66,122', 13)}${limb('M80,92 Q90,106 82,122', 13)}${torso}${limb('M86,58 Q98,50 108,44', 10)}${joint(108, 44, 6, BAR)}`
      ];
    }
  },
  puxada: {
    view: 'front',
    label: 'Costas em destaque',
    build: () => {
      const base = standingFrontBase();
      const lats = `${hrect(56, 46, 12, 34, 6)}${hrect(92, 46, 12, 34, 6)}`;
      return [
        `${groundShadow(80, 40)}${base}${lats}${limb('M64,42 Q46,30 30,22', 11)}${limb('M96,42 Q114,30 130,22', 11)}${bar(30, 18, 100)}`,
        `${groundShadow(80, 40)}${base}${lats}${limb('M64,50 Q56,64 52,80', 11)}${limb('M96,50 Q104,64 108,80', 11)}${bar(52, 76, 56)}`
      ];
    }
  },
  lateral: {
    view: 'front',
    label: 'Ombro em destaque',
    build: () => {
      const base = standingFrontBase();
      const delts = `${hcircle(64, 44, 10)}${hcircle(96, 44, 10)}`;
      return [
        `${groundShadow(80, 40)}${base}${delts}${limb('M64,46 Q56,68 54,90', 11)}${limb('M96,46 Q104,68 106,90', 11)}${joint(54, 92, 7, BAR)}${joint(106, 92, 7, BAR)}`,
        `${groundShadow(80, 40)}${base}${delts}${limb('M64,44 Q42,42 20,40', 11)}${limb('M96,44 Q118,42 140,40', 11)}${joint(20, 40, 7, BAR)}${joint(140, 40, 7, BAR)}`
      ];
    }
  },
  rosca: {
    view: 'front',
    label: 'Bíceps em destaque',
    build: () => {
      const base = standingFrontBase();
      const armHighlight = `${hrect(52, 46, 12, 34, 6)}${hrect(96, 46, 12, 34, 6)}`;
      return [
        `${groundShadow(80, 40)}${base}${armHighlight}${limb('M58,80 Q56,96 54,112', 10)}${limb('M102,80 Q104,96 106,112', 10)}${joint(54, 114, 6, BAR)}${joint(106, 114, 6, BAR)}`,
        `${groundShadow(80, 40)}${base}${armHighlight}${limb('M58,80 Q46,66 44,50', 10)}${limb('M102,80 Q114,66 116,50', 10)}${joint(44, 48, 6, BAR)}${joint(116, 48, 6, BAR)}`
      ];
    }
  },
  crucifixo: {
    view: 'front',
    label: 'Peito em destaque',
    build: () => {
      const base = standingFrontBase();
      const chest = hrect(68, 46, 24, 30, 12);
      return [
        `${groundShadow(80, 40)}${base}${chest}${limb('M64,50 Q42,48 22,46', 11)}${limb('M96,50 Q118,48 138,46', 11)}${joint(22, 46, 7, BAR)}${joint(138, 46, 7, BAR)}`,
        `${groundShadow(80, 40)}${base}${chest}${limb('M64,52 Q70,60 80,66', 11)}${limb('M96,52 Q90,60 80,66', 11)}${joint(80, 68, 6, BAR)}`
      ];
    }
  },
  flexao: {
    view: 'side',
    label: 'Peito em destaque',
    build: () => {
      const floor = `<rect x="18" y="112" width="124" height="6" rx="3" fill="color-mix(in srgb, var(--mol-border) 55%, transparent)"/>`;
      const feet = `<ellipse cx="26" cy="110" rx="8" ry="4" fill="${BODY}"/>`;
      const bodyUp = `${limb('M26,108 Q64,96 100,82', 14)}${joint(100, 82, 8)}`;
      const bodyDown = `${limb('M26,108 Q64,102 96,96', 14)}${joint(96, 96, 8)}`;
      const headUp = joint(114, 74, 9);
      const headDown = joint(108, 90, 9);
      const chestUp = hrect(76, 76, 28, 16, 8);
      const chestDown = hrect(72, 90, 28, 16, 8);
      return [
        `${groundShadow(84, 60)}${floor}${feet}${bodyDown}${chestDown}${headDown}${hlimb('M96,96 Q80,104 98,112', 10)}`,
        `${groundShadow(84, 60)}${floor}${feet}${bodyUp}${chestUp}${headUp}${hlimb('M100,82 Q100,96 100,112', 10)}`
      ];
    }
  },
  pullover: {
    view: 'side',
    label: 'Peito e dorsal em destaque',
    build: () => {
      const body = lyingBase(true);
      const legs = limb('M46,80 Q30,92 20,120', 15);
      return [
        `${body}${legs}${limb('M100,72 Q100,50 88,34', 12)}${plate(84, 30)}`,
        `${body}${legs}${limb('M100,72 Q99,56 98,45', 12)}${plate(98, 42.5)}`
      ];
    }
  },
  mergulho: {
    view: 'side',
    label: 'Tríceps e peito em destaque',
    build: () => {
      const bars = `<rect x="30" y="60" width="6" height="50" rx="3" fill="color-mix(in srgb, var(--mol-border) 55%, transparent)"/><rect x="96" y="60" width="6" height="50" rx="3" fill="color-mix(in srgb, var(--mol-border) 55%, transparent)"/>`;
      const head = joint(64, 40, 10);
      const legs = limb('M70,88 Q74,104 70,120', 12);
      const torsoUp = hrect(56, 50, 24, 38, 12);
      const armsUp = `${limb('M58,54 Q42,58 32,64', 10)}${limb('M80,54 Q96,58 100,64', 10)}`;
      const torsoDown = hrect(60, 62, 26, 36, 13);
      const armsDown = `${limb('M62,66 Q42,62 32,64', 10)}${limb('M84,66 Q98,62 100,64', 10)}`;
      return [
        `${groundShadow(66, 40)}${bars}${head}${legs}${torsoUp}${armsUp}`,
        `${groundShadow(66, 40)}${bars}${joint(64, 56, 10)}${limb('M70,104 Q74,112 70,120', 12)}${torsoDown}${armsDown}`
      ];
    }
  },
  terra: {
    view: 'side',
    label: 'Posterior e lombar em destaque',
    build: () => {
      const legs = `${limb('M66,84 Q64,104 62,122', 15)}${limb('M78,84 Q80,104 82,122', 15)}`;
      const armDown = limb('M76,58 Q66,72 60,88', 9);
      const hinged = `${joint(84, 40, 9)}${hlimb('M84,44 Q78,56 74,72', 20)}`;
      const standTorso = `${joint(72, 30, 9)}${hlimb('M72,34 Q72,52 72,72', 20)}`;
      const armStand = limb('M72,50 Q66,66 62,86', 9);
      return [
        `${groundShadow(72, 40)}${legs}${hinged}${armDown}${plate(60, 90)}`,
        `${groundShadow(72, 40)}${legs}${standTorso}${armStand}${plate(62, 88)}`
      ];
    }
  },
  panturrilha: {
    view: 'side',
    label: 'Panturrilha em destaque',
    build: () => {
      const step = `<rect x="50" y="116" width="34" height="8" rx="3" fill="color-mix(in srgb, var(--mol-border) 55%, transparent)"/>`;
      const head = joint(66, 30, 10);
      const torso = `${joint(66, 42, 7)}<rect x="54" y="42" width="24" height="40" rx="12" fill="${BODY}"/>`;
      const arm = limb('M60,48 Q52,60 50,74', 8);
      const legsFlat = `${hlimb('M62,82 Q60,98 60,116', 12)}${hlimb('M74,82 Q76,98 76,116', 12)}`;
      const legsUp = `${hlimb('M62,82 Q60,100 61,113', 12)}${hlimb('M74,82 Q76,100 75,113', 12)}`;
      return [
        `${groundShadow(66, 40)}${step}${head}${torso}${arm}${legsFlat}<ellipse cx="60" cy="118" rx="8" ry="3" fill="${BODY}"/><ellipse cx="76" cy="118" rx="8" ry="3" fill="${BODY}"/>`,
        `${groundShadow(66, 40)}${step}${joint(66, 26, 10)}${joint(66, 38, 7)}<rect x="54" y="38" width="24" height="40" rx="12" fill="${BODY}"/>${limb('M60,44 Q52,56 50,70', 8)}${legsUp}<ellipse cx="61" cy="112" rx="7" ry="3" fill="${BODY}" transform="rotate(-24 61 112)"/><ellipse cx="75" cy="112" rx="7" ry="3" fill="${BODY}" transform="rotate(24 75 112)"/>`
      ];
    }
  },
  abdomen: {
    view: 'side',
    label: 'Abdômen em destaque',
    build: () => {
      const legs = `${limb('M84,104 Q98,100 104,86', 13)}${limb('M84,104 Q84,120 78,124', 13)}`;
      const flat = `${joint(38, 96, 9)}${hlimb('M40,98 Q60,100 84,104', 16)}${limb('M46,92 Q38,86 30,84', 7)}`;
      const curled = `${joint(48, 78, 9)}${hlimb('M50,82 Q66,94 84,104', 16)}${limb('M52,76 Q42,72 33,76', 7)}`;
      return [
        `${groundShadow(64, 56)}${legs}${flat}`,
        `${groundShadow(64, 56)}${legs}${curled}`
      ];
    }
  },
  antebraco: {
    view: 'side',
    label: 'Antebraço em destaque',
    build: () => {
      const seat = `<rect x="46" y="98" width="14" height="22" rx="5" fill="color-mix(in srgb, var(--mol-border) 40%, transparent)"/>`;
      const head = `${joint(56, 44, 9)}${joint(58, 56, 7)}<rect x="48" y="56" width="20" height="34" rx="10" fill="${BODY}"/>`;
      const thigh = `<rect x="60" y="88" width="34" height="13" rx="6.5" fill="${BODY}"/>`;
      const upperArm = limb('M62,66 Q76,74 84,84', 10);
      return [
        `${groundShadow(70, 56)}${seat}${head}${thigh}${upperArm}${hlimb('M84,84 Q90,92 88,100', 10)}${plate(88, 102)}`,
        `${groundShadow(70, 56)}${seat}${head}${thigh}${upperArm}${hlimb('M84,84 Q94,80 100,74', 10)}${plate(100, 72)}`
      ];
    }
  },
  abducao: {
    view: 'front',
    label: 'Quadril em destaque',
    build: () => {
      const seat = `<rect x="50" y="96" width="60" height="14" rx="6" fill="color-mix(in srgb, var(--mol-border) 40%, transparent)"/>`;
      const head = `${joint(80, 30, 10)}${joint(80, 42, 6)}<rect x="66" y="42" width="28" height="40" rx="14" fill="${BODY}"/>`;
      const arms = `${limb('M68,52 Q56,60 50,70', 9)}${limb('M92,52 Q104,60 110,70', 9)}`;
      const legsIn = `${hlimb('M72,88 Q68,102 66,116', 15)}${hlimb('M88,88 Q92,102 94,116', 15)}`;
      const legsOut = `${hlimb('M72,88 Q56,100 48,114', 15)}${hlimb('M88,88 Q104,100 112,114', 15)}`;
      return [
        `${groundShadow(80, 46)}${seat}${head}${arms}${legsIn}`,
        `${groundShadow(80, 46)}${seat}${head}${arms}${legsOut}`
      ];
    }
  },
  afundo: {
    view: 'side',
    label: 'Quadríceps e glúteo em destaque',
    build: () => {
      const head = joint(70, 26, 10);
      const torso = `${joint(70, 38, 7)}<rect x="58" y="38" width="24" height="38" rx="12" fill="${BODY}"/>`;
      const arms = `${limb('M62,44 Q52,54 48,66', 8)}${limb('M78,44 Q88,54 92,66', 8)}`;
      const backLegStand = limb('M74,74 Q78,96 76,118', 13);
      const frontLegStand = hlimb('M66,74 Q62,96 64,118', 13);
      const backLegLunge = limb('M74,74 Q86,90 96,112', 13);
      const frontLegLunge = hlimb('M66,74 Q52,92 48,116', 13);
      return [
        `${groundShadow(70, 46)}${head}${torso}${arms}${backLegStand}${frontLegStand}`,
        `${groundShadow(70, 46)}${head}${torso}${arms}${backLegLunge}${frontLegLunge}`
      ];
    }
  },
  coice: {
    view: 'side',
    label: 'Glúteo em destaque',
    build: () => {
      const support = `<rect x="18" y="40" width="6" height="60" rx="3" fill="color-mix(in srgb, var(--mol-border) 55%, transparent)"/>`;
      const head = joint(46, 50, 9);
      const torso = `${joint(46, 60, 7)}<rect x="36" y="60" width="22" height="32" rx="11" fill="${BODY}" transform="rotate(12 46 76)"/>`;
      const arm = limb('M36,66 Q26,68 20,72', 8);
      const standLeg = limb('M64,88 Q66,104 64,120', 13);
      return [
        `${groundShadow(66, 56)}${support}${head}${torso}${arm}${standLeg}${hlimb('M64,88 Q66,104 64,120', 13)}`,
        `${groundShadow(66, 56)}${support}${head}${torso}${arm}${standLeg}${hlimb('M64,88 Q84,86 100,78', 13)}`
      ];
    }
  }
};

function svgWrap(view, inner) {
  const viewBox = view === 'front' ? '0 0 160 160' : '0 0 160 130';
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" class="mol-exercise-pose" role="img" aria-hidden="true">${inner}</svg>`;
}

function resolvePose(exercise) {
  const key = movementCategory(exercise);
  return POSES[key] || POSES.generic;
}

/**
 * Gera os dois quadros (início/fim) da pose ilustrada do exercício, como
 * markup SVG completo pronto pra injetar via innerHTML (nunca via
 * <img src="data:...">, que isola o SVG das variáveis CSS do documento).
 * @param {{nome?: string}} exercise
 * @returns {[string, string]}
 */
export function exercisePoseFrames(exercise = {}) {
  const pose = resolvePose(exercise);
  const [frameA, frameB] = pose.build();
  return [svgWrap(pose.view, frameA), svgWrap(pose.view, frameB)];
}

export function exercisePoseLabel(exercise = {}) {
  return resolvePose(exercise).label;
}
