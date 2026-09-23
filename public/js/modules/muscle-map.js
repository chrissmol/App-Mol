// Mapa muscular: um boneco estilizado (não anatômico-realista) dividido
// em zonas coloríveis, para visualizar volume de treino por músculo —
// frente e costas lado a lado, como um heatmap simples.

const ZONE_LABELS = {
  peito: 'Peito', costas: 'Costas', ombros: 'Ombros', abdomen: 'Abdômen',
  biceps: 'Bíceps', triceps: 'Tríceps', antebraco: 'Antebraço',
  quadriceps: 'Quadríceps', posterior: 'Posterior de coxa', gluteo: 'Glúteo',
  panturrilha: 'Panturrilha'
};

export const MUSCLE_ZONES = Object.keys(ZONE_LABELS);

function zoneIntensity(score, maxScore) {
  if (!score || !maxScore) return 0;
  return Math.max(0.28, Math.min(1, score / maxScore));
}

function zoneFill(score, maxScore) {
  const intensity = zoneIntensity(score, maxScore);
  if (!intensity) return 'var(--mol-surface-soft)';
  return `color-mix(in srgb, var(--mol-neon) ${Math.round(intensity * 100)}%, var(--mol-surface-soft))`;
}

function zoneGlowStyle(score, maxScore) {
  const intensity = zoneIntensity(score, maxScore);
  if (!intensity) return '';
  const blur = Math.round(3 + intensity * 7);
  const opacity = Math.round((0.3 + intensity * 0.5) * 100) / 100;
  return `style="filter: drop-shadow(0 0 ${blur}px color-mix(in srgb, var(--mol-neon) ${Math.round(opacity * 100)}%, transparent))"`;
}

// Sobrepõe um brilho radial sutil (canto superior-esquerdo) em cima de
// cada segmento, pra dar volume/aspecto esculpido em vez de cor chapada.
function sheen(x, y, width, height, rx) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="url(#mol-muscle-sheen)" pointer-events="none"/>`;
}

function figure({ view, scores, maxScore }) {
  const fill = zone => zoneFill(scores[zone] || 0, maxScore);
  const glow = zone => zoneGlowStyle(scores[zone] || 0, maxScore);
  const torsoZone = view === 'front' ? 'peito' : 'costas';
  const upperArmZone = view === 'front' ? 'biceps' : 'triceps';
  const thighZone = view === 'front' ? 'quadriceps' : 'posterior';
  const hipsZone = view === 'front' ? null : 'gluteo';
  const stroke = 'stroke="color-mix(in srgb, var(--mol-border) 70%, transparent)" stroke-width="1" class="mol-muscle-segment"';
  const seg = (zone, extra) => `data-zone="${zone}" role="img" aria-label="${ZONE_LABELS[zone]}: ${Math.round((scores[zone] || 0) * 10) / 10} pt" fill="${fill(zone)}" ${stroke} ${glow(zone)} ${extra || ''}`;
  const decor = `fill="var(--mol-surface-soft)" ${stroke}`;
  return `
    <text x="80" y="16" text-anchor="middle" class="mol-muscle-caption">${view === 'front' ? 'FRENTE' : 'COSTAS'}</text>
    <ellipse cx="82" cy="180" rx="72" ry="150" fill="url(#mol-muscle-ambient)" pointer-events="none"/>
    <g transform="translate(0,20)">
    <ellipse cx="80" cy="26" rx="17" ry="19" ${decor}/>
    <rect x="72" y="42" width="16" height="16" rx="6" ${decor}/>
    <rect x="46" y="52" width="68" height="66" rx="22" ${seg(torsoZone)}/>
    ${sheen(50, 55, 30, 32, 16)}
    ${view === 'front' ? `<rect x="53" y="110" width="54" height="50" rx="16" ${seg('abdomen')}/>${sheen(56, 113, 22, 22, 11)}` : ''}
    <rect x="49" y="154" width="62" height="24" rx="15" ${hipsZone ? seg(hipsZone) : decor}/>
    <ellipse cx="41" cy="63" rx="16" ry="16" ${seg('ombros')}/>
    <ellipse cx="119" cy="63" rx="16" ry="16" ${seg('ombros')}/>
    <rect x="25" y="74" width="21" height="70" rx="10.5" ${seg(upperArmZone)}/>
    ${sheen(27, 78, 8, 26, 4)}
    <rect x="113" y="74" width="21" height="70" rx="10.5" ${seg(upperArmZone)}/>
    <rect x="27" y="144" width="18" height="62" rx="9" ${seg('antebraco')}/>
    <rect x="114" y="144" width="18" height="62" rx="9" ${seg('antebraco')}/>
    <ellipse cx="36" cy="214" rx="10" ry="12" ${decor}/>
    <ellipse cx="124" cy="214" rx="10" ry="12" ${decor}/>
    <rect x="51" y="177" width="27" height="92" rx="13.5" ${seg(thighZone)}/>
    ${sheen(54, 182, 11, 34, 5.5)}
    <rect x="81" y="177" width="27" height="92" rx="13.5" ${seg(thighZone)}/>
    <rect x="54" y="270" width="21" height="60" rx="10.5" ${seg('panturrilha')}/>
    <rect x="84" y="270" width="21" height="60" rx="10.5" ${seg('panturrilha')}/>
    <ellipse cx="65" cy="336" rx="14" ry="8" ${decor}/>
    <ellipse cx="95" cy="336" rx="14" ry="8" ${decor}/>
    </g>
  `;
}

/**
 * Gera o SVG do mapa muscular (frente + costas) a partir de um mapa
 * zona -> pontuação (ex.: o retorno de muscleZoneScores/volumeByMuscleZone
 * de workout-analytics.js). Zonas sem pontuação ficam neutras.
 * @param {Record<string, number>} scores
 */
export function renderMuscleMap(scores = {}) {
  const maxScore = Math.max(0, ...Object.values(scores));
  const front = figure({ view: 'front', scores, maxScore });
  const back = figure({ view: 'back', scores, maxScore });
  return `<svg viewBox="0 0 344 368" xmlns="http://www.w3.org/2000/svg" class="mol-muscle-map" aria-hidden="false">
    <defs>
      <radialGradient id="mol-muscle-sheen" cx="30%" cy="22%" r="80%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity=".38"/>
        <stop offset="55%" stop-color="#ffffff" stop-opacity=".07"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="mol-muscle-ambient" cx="50%" cy="30%" r="65%">
        <stop offset="0%" stop-color="var(--mol-neon)" stop-opacity=".14"/>
        <stop offset="100%" stop-color="var(--mol-neon)" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <g transform="translate(0,0)">${front}</g>
    <g transform="translate(184,0)">${back}</g>
  </svg>`;
}

export function muscleMapLegendEntries(scores = {}) {
  return MUSCLE_ZONES
    .map(zone => ({ zone, label: ZONE_LABELS[zone], score: scores[zone] || 0 }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}
