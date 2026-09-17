import { spawn } from 'node:child_process';

const agents = [
  ['code', 'npm.cmd', ['run', 'lint']],
  ['unit', 'npm.cmd', ['test', '--', '--run']],
  ['html', 'npm.cmd', ['run', 'test:html']],
  ['css', 'npm.cmd', ['run', 'css:check']],
  ['security', 'npm.cmd', ['run', 'security:scan']],
  ['visual-and-flows', 'npx.cmd', ['playwright', 'test', 'e2e/visual-themes.spec.js', 'e2e/wide-layout.spec.js', 'e2e/console-health.spec.js', '--project=desktop']]
];

const run = ([name, command, args]) => new Promise(resolve => {
  const child = spawn(command, args, { stdio: 'inherit', shell: true });
  child.on('close', code => resolve({ name, code: code ?? 1 }));
});
const results = await Promise.all(agents.map(run));
const failed = results.filter(result => result.code !== 0);
console.log(`Micro-agents: ${results.length - failed.length} passed, ${failed.length} failed`);
if (failed.length) process.exit(1);
