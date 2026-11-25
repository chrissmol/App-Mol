// Resume as sessões do dia no formato curto que a central mostra.
export function resumo(sessoes) {
  if (!sessoes.length) return { treinou: false };
  const feitas = s => s.exercicios.flatMap(e => e.series || []).filter(x => x.concluida).length;
  const ultima = sessoes.reduce((a, b) => (b.concluidoEm > a.concluidoEm ? b : a));
  return {
    treinou: true,
    nome: sessoes.map(s => s.nomeRotina).join(' + '),
    minutos: Math.round(sessoes.reduce((t, s) => t + (s.duracaoSegundos || 0), 0) / 60),
    volumeKg: Math.round(sessoes.reduce((t, s) => t + (s.volumeTotal || 0), 0)),
    series: sessoes.reduce((t, s) => t + feitas(s), 0),
    hora: new Date(ultima.concluidoEm).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
  };
}
