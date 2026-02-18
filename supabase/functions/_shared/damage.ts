import type { PlayerState, PartName } from './types.ts';

interface DamageResult {
  targetState: PlayerState;
  shieldDamage: number;
  armorDamage: number;
  partHpDamage: number;
  componentDestroyed: string | null;
  eliminated: boolean;
}

export function resolveDamage(
  player: PlayerState,
  rawDamage: number,
  targetPart: PartName,
  energyType: string
): DamageResult {
  const state = structuredClone(player);
  let remaining = rawDamage;
  let shieldDamage = 0, armorDamage = 0, partHpDamage = 0;
  let componentDestroyed: string | null = null;

  // 1. Shields
  if (state.shield && state.shield.sp > 0) {
    const resist = state.shield.resist_profile[energyType] ?? 1.0;
    const effectiveDamage = Math.round(remaining * resist);
    const absorbed = Math.min(state.shield.sp, effectiveDamage);
    shieldDamage = absorbed;
    state.shield.sp -= absorbed;
    remaining = Math.max(0, effectiveDamage - absorbed);
  }

  if (remaining <= 0) return { targetState: state, shieldDamage, armorDamage, partHpDamage, componentDestroyed, eliminated: false };

  const part = state.parts[targetPart];

  // 2. Part armor
  if (part.armor > 0) {
    const absorbed = Math.min(part.armor, remaining);
    armorDamage = absorbed;
    part.armor -= absorbed;
    remaining -= absorbed;
  }

  if (remaining <= 0) return { targetState: state, shieldDamage, armorDamage, partHpDamage, componentDestroyed, eliminated: false };

  // 3. Components absorb overflow before part HP
  for (const comp of part.installed_components) {
    if (!comp.is_active) continue;
    if (comp.hp >= remaining) {
      comp.hp -= remaining;
      remaining = 0;
      if (comp.hp <= 0) { comp.is_active = false; componentDestroyed = comp.card_id; }
      break;
    } else {
      remaining -= comp.hp;
      comp.hp = 0;
      comp.is_active = false;
      componentDestroyed = comp.card_id;
    }
  }

  // 4. Part HP
  if (remaining > 0) {
    partHpDamage = remaining;
    part.hp = Math.max(0, part.hp - remaining);
  }

  // 5. Elimination check
  const totalHp = Object.values(state.parts).reduce((s, p) => s + p.hp, 0);
  if (totalHp <= 0) state.is_eliminated = true;

  return { targetState: state, shieldDamage, armorDamage, partHpDamage, componentDestroyed, eliminated: state.is_eliminated };
}

export function rollDice(notation: string): number {
  // e.g. "4d6" → roll 4 six-sided dice
  const match = notation.match(/^(\d+)d(\d+)$/);
  if (!match) return parseInt(notation, 10);
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
  return total;
}
