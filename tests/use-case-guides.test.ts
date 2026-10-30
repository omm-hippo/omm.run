import assert from 'node:assert/strict';
import test from 'node:test';
import { REFERENCE, type ReferenceEntry } from '../src/lib/commands/reference';
import { getUseCases, USE_CASE_SLUGS } from '../src/i18n/use-cases';

/** Walk `omm a b …` down the exported CLI reference. Returns a problem, or null.
 *  Placeholders are written `<like-this>` and arguments are not checked. */
function commandProblem(command: string): string | null {
  const tokens = command.trim().split(/\s+/u);
  if (tokens[0] !== 'omm') return 'does not start with omm';
  let entry: ReferenceEntry | undefined;
  const path: string[] = [];
  let i = 1;
  while (i < tokens.length && !/^[-<]/u.test(tokens[i])) {
    const next = REFERENCE.commands.find((candidate) => candidate.path.length === path.length + 1
      && candidate.path.every((part, index) => part === (index < path.length ? path[index] : tokens[i])));
    if (!next) break;
    entry = next;
    path.push(tokens[i]);
    i += 1;
  }
  if (!entry) return `unknown command ${tokens[1]}`;
  if (entry.kind === 'group' && i < tokens.length && !/^[-<]/u.test(tokens[i])) return `unknown subcommand ${tokens[i]} of omm ${path.join(' ')}`;
  for (const token of tokens.slice(i)) {
    if (!token.startsWith('-')) continue;
    const flag = token.split('=')[0];
    if (!entry.options.some((option) => option.flags.includes(flag))) return `omm ${path.join(' ')} has no ${flag}`;
  }
  return null;
}

test('every command a guide tells readers to run exists in the CLI reference', () => {
  for (const locale of ['ko', 'en'] as const) {
    for (const guide of getUseCases(locale)) {
      const commands = [...guide.steps.flatMap((step) => step.commands ?? []), ...(guide.undo?.commands ?? [])];
      assert.ok(commands.length > 0, guide.slug);
      for (const command of commands) assert.equal(commandProblem(command), null, `${locale}/${guide.slug}: ${command}`);
    }
  }
});

test('guides are complete and the two languages run the same commands', () => {
  const ko = getUseCases('ko');
  const en = getUseCases('en');
  assert.deepEqual(ko.map((guide) => guide.slug), [...USE_CASE_SLUGS]);
  assert.deepEqual(en.map((guide) => guide.slug), [...USE_CASE_SLUGS]);
  // Placeholders may be translated (`<검색어>` / `<query>`); everything else must match.
  const shape = (commands: readonly string[]) => commands.map((command) => command.replace(/<[^>]+>/gu, '<>'));
  for (const [index, guide] of ko.entries()) {
    const other = en[index];
    assert.ok(guide.outcome && guide.requirements.length && guide.verify.length && guide.troubles.length, guide.slug);
    assert.ok(guide.steps.length >= 4, `${guide.slug} has fewer than 4 steps`);
    assert.ok(guide.references.every((ref) => ref.href.startsWith('/commands/')), guide.slug);
    assert.deepEqual(guide.steps.map((step) => shape(step.commands ?? [])), other.steps.map((step) => shape(step.commands ?? [])), guide.slug);
    assert.deepEqual(shape(guide.undo?.commands ?? []), shape(other.undo?.commands ?? []), guide.slug);
    assert.deepEqual(guide.troubles.map((item) => item.message), other.troubles.map((item) => item.message), `${guide.slug}: CLI messages are quoted verbatim in both languages`);
  }
});

test('the command walker rejects invented commands and flags', () => {
  assert.equal(commandProblem('omm cluster init'), null);
  assert.match(commandProblem('omm cluster frobnicate') ?? '', /unknown subcommand/u);
  assert.match(commandProblem('omm scan --nope') ?? '', /has no --nope/u);
  assert.match(commandProblem('omm nothing') ?? '', /unknown command/u);
});
