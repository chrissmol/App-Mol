/** "1 exercício", "3 exercícios", "0 exercícios" (pt-BR: singular só para 1). */
export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
