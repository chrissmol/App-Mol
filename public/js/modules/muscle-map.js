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

function zoneFill(score, maxScore) {
  if (!score || !maxScore) return 'var(--mol-surface-soft)';
  const intensity = Math.max(0.28, Math.min(1, score / maxScore));
  return `color-mix(in srgb, var(--mol-neon) ${Math.round(intensity * 100)}%, var(--mol-surface-soft))`;
}

function figure({ view, scores, maxScore }) {
  const fill = zone => zoneFill(scores[zone] || 0, maxScore);
  const torsoZone = view === 'front' ? 'peito' : 'costas';
  const upperArmZone = view === 'front' ? 'biceps' : 'triceps';
  const thighZone = view === 'front' ? 'quadriceps' : 'posterior';
  const hipsZone = view === 'front' ? null : 'gluteo';
  const stroke = 'stroke="var(--mol-border)" stroke-width="1.5" class="mol-muscle-segment"';
  const seg = (zone, extra) => `data-zone="${zone}" role="img" aria-label="${ZONE_LABELS[zone]}: ${Math.round((scores[zone] || 0) * 10) / 10} pt" fill="${fill(zone)}" ${stroke} ${extra || ''}`;
  const decor = `fill="var(--mol-surface-soft)" ${stroke}`;
  return `
    <text x="80" y="16" text-anchor="middle" class="mol-muscle-caption">${view === 'front' ? 'FRENTE' : 'COSTAS'}</text>
    <g transform="translate(0,20)">
    <ellipse cx="80" cy="26" rx="17" ry="19" ${decor}/>
    <rect x="72" y="42" width="16" height="14" rx="6" ${decor}/>
    <rect x="48" y="54" width="64" height="62" rx="18" ${seg(torsoZone)}/>
    ${view === 'front' ? `<rect x="54" y="112" width="52" height="48" rx="14" ${seg('abdomen')}/>` : ''}
    <rect x="50" y="156" width="60" height="22" rx="14" ${hipsZone ? seg(hipsZone) : decor}/>
    <ellipse cx="40" cy="64" rx="15" ry="15" ${seg('ombros')}/>
    <ellipse cx="120" cy="64" rx="15" ry="15" ${seg('ombros')}/>
    <rect x="26" y="76" width="20" height="68" rx="10" ${seg(upperArmZone)}/>
    <rect x="114" y="76" width="20" height="68" rx="10" ${seg(upperArmZone)}/>
    <rect x="28" y="146" width="17" height="60" rx="8" ${seg('antebraco')}/>
    <rect x="115" y="146" width="17" height="60" rx="8" ${seg('antebraco')}/>
    <ellipse cx="36" cy="214" rx="10" ry="12" ${decor}/>
    <ellipse cx="124" cy="214" rx="10" ry="12" ${decor}/>
    <rect x="52" y="180" width="26" height="90" rx="13" ${seg(thighZone)}/>
    <rect x="82" y="180" width="26" height="90" rx="13" ${seg(thighZone)}/>
    <rect x="55" y="272" width="20" height="58" rx="10" ${seg('panturrilha')}/>
    <rect x="85" y="272" width="20" height="58" rx="10" ${seg('panturrilha')}/>
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
