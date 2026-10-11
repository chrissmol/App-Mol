// Vite: `import url from 'arquivo.wasm?url'` devolve o caminho público do arquivo.
declare module '*.wasm?url' {
  const url: string;
  export default url;
}
