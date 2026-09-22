/**
 * Envolve uma promessa com um teto de tempo, rejeitando com uma mensagem
 * legível se ela não resolver a tempo. Usado nas leituras do Firestore
 * para nunca deixar uma tela travada "Carregando..." para sempre quando
 * a rede está lenta ou instável.
 * @param {Promise<any>} promise
 * @param {string} label
 * @param {number} [milliseconds]
 */
export function withTimeout(promise, label, milliseconds = 9000) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} excedeu o tempo de resposta.`)), milliseconds); })
  ]).finally(() => clearTimeout(timer));
}
