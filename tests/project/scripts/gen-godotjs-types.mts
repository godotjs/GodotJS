import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const testsProjectRoot = join(import.meta.dirname, '..');

const godotBinary = process.env.GODOT;

if (!godotBinary) {
  throw new Error('GODOT environment variable is required. Example: GODOT=/Applications/Godot47.app/Contents/MacOS/Godot');
}

// Project type generation loads autoload/module scripts, so emit JS first even on clean trees.
execFileSync('pnpm', ['exec', 'tsc', '--noCheck'], {
  cwd: testsProjectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

execFileSync(
	godotBinary,
	['--headless', '--editor', '--generate-types', '--path', testsProjectRoot],
	{ stdio: 'inherit' },
);

// The placeholder file is useful for in-module compilation, but it conflicts with strict project checks.
rmSync(join(testsProjectRoot, 'typings', 'godot.generated.d.ts'), { force: true });
