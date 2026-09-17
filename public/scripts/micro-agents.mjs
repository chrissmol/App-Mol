import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const npxCommand = isWindows ? 'npx.cmd' : 'npx';

const agents = [
  ['code', npmCommand, ['run', 'lint']],
  ['unit', npmCommand, ['test', '--', '--run']],
  ['html', npmCommand, ['run', 'test:html']],
  ['css', npmCommand, ['run', 'css:check']],
  ['security', npmCommand, ['run', 'security:scan']],
  ['visual-and-flows', npxCommand, ['playwright', 'test', 'e2e/visual-themes.spec.js', 'e2e/wide-layout.spec.js', 'e2e/console-health.spec.js', '--project=desktop']]
];

const run = ([name, command, args]) => new Promise(resolve => {
  const child = spawn(command, args, { stdio: 'inherit', shell: true });
  child.on('close', code => resolve({ name, code: code ?? 1 }));
});
const results = await Promise.all(agents.map(run));
const failed = results.filter(result => result.code !== 0);
console.log(`Micro-agents: ${results.length - failed.length} passed, ${failed.length} failed`);
if (failed.length) process.exit(1);
