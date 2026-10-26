import { rawWeightIllustration } from './memory';
import { isModelTask, type ModelTask, type ModelView, type WikiModel } from './types';

export const SYSTEMS = ['windows', 'macos', 'linux'] as const;
export const ACCELERATORS = ['cpu', 'apple', 'nvidia', 'amd', 'intel'] as const;
export const CONTEXTS = [4096, 8192, 16384, 32768] as const;
export type HardwareProfile = {
  system: typeof SYSTEMS[number];
  accelerator: typeof ACCELERATORS[number];
  ramGB: number;
  vramGB?: number;
  diskGB?: number;
  task?: ModelTask;
  bits: 4 | 8;
  context: typeof CONTEXTS[number];
};
export type ProfileIssue = 'system' | 'accelerator' | 'ram' | 'vram' | 'disk' | 'task' | 'bits' | 'context';
export type Candidate<M> = {
  model: M;
  weightGB: number;
  planningGB: number;
  budgetGB: number;
  route: 'gpu' | 'unified' | 'cpu';
  headroom: 'comfortable' | 'tight';
};

export function validateProfile(profile: HardwareProfile): ProfileIssue[] {
  const issues: ProfileIssue[] = [];
  if (!SYSTEMS.includes(profile.system)) issues.push('system');
  if (!ACCELERATORS.includes(profile.accelerator) || (profile.accelerator === 'apple' && profile.system !== 'macos')) issues.push('accelerator');
  if (!Number.isFinite(profile.ramGB) || profile.ramGB < 4 || profile.ramGB > 2048) issues.push('ram');
  if (['nvidia', 'amd', 'intel'].includes(profile.accelerator) && (!Number.isFinite(profile.vramGB) || profile.vramGB! < 1 || profile.vramGB! > 512)) issues.push('vram');
  if (profile.diskGB !== undefined && (!Number.isFinite(profile.diskGB) || profile.diskGB < 0 || profile.diskGB > 100000)) issues.push('disk');
  if (profile.task !== undefined && !isModelTask(profile.task)) issues.push('task');
  if (profile.bits !== 4 && profile.bits !== 8) issues.push('bits');
  if (!(CONTEXTS as readonly number[]).includes(profile.context)) issues.push('context');
  return issues;
}

/** Editorial screening allowance, NOT a checkpoint-specific RAM/KV estimate.
 * Total parameters (including inactive MoE experts) are always used.
 * Actual quantization, KV layout, runner support and download must be checked.
 */
export function planningMemory(model: WikiModel | ModelView, profile: HardwareProfile) {
  const weightGB = rawWeightIllustration(model.parameterScaleB, profile.bits) * 1.2;
  const planningGB = weightGB + 2 + profile.context / 4096 + (model.inputs.some((input) => input !== 'text') ? 2 : 0);
  return { weightGB, planningGB };
}

// Decimal input and binary floating-point arithmetic may differ at a boundary.
const exceeds = (value: number, budget: number) => value - budget > 1e-9;

export function recommendModels<M extends WikiModel | ModelView>(models: readonly M[], profile: HardwareProfile): Candidate<M>[] {
  if (validateProfile(profile).length) return [];
  const ramBudget = Math.max(0, profile.ramGB - Math.max(4, profile.ramGB * 0.25));
  // Dedicated VRAM and system RAM are never added together. Integrated graphics
  // use the CPU/shared-RAM path; the form explicitly explains this choice.
  const gpuBudget = profile.vramGB === undefined ? 0 : Math.max(0, profile.vramGB - Math.max(1, profile.vramGB * 0.1));
  const dedicated = ['nvidia', 'amd', 'intel'].includes(profile.accelerator);
  return models.flatMap((model): Candidate<M>[] => {
    if (profile.task && !model.tasks.includes(profile.task)) return [];
    if (model.context.tokens < profile.context) return [];
    const { weightGB, planningGB } = planningMemory(model, profile);
    if (profile.diskGB !== undefined && exceeds(weightGB * 1.1, profile.diskGB)) return [];
    const route = profile.accelerator === 'apple' ? 'unified' : dedicated && profile.ramGB >= 8 && !exceeds(planningGB, gpuBudget) ? 'gpu' : 'cpu';
    const budgetGB = route === 'gpu' ? gpuBudget : ramBudget;
    if (exceeds(planningGB, budgetGB)) return [];
    return [{ model, weightGB, planningGB, budgetGB, route, headroom: !exceeds(planningGB, budgetGB * 0.8) ? 'comfortable' : 'tight' }];
  }).sort((a, b) =>
    Number(b.route !== 'cpu') - Number(a.route !== 'cpu') ||
    Number(b.headroom === 'comfortable') - Number(a.headroom === 'comfortable') ||
    b.model.parameterScaleB - a.model.parameterScaleB || a.model.id.localeCompare(b.model.id),
  );
}
