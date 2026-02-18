import { assertEquals } from 'https://deno.land/std/assert/mod.ts';
import { resolveDamage } from './damage.ts';
import type { PlayerState, PartName } from './types.ts';

function makePlayer(torsoHp: number, torsoArmor: number, shieldSp: number | null): PlayerState {
  const parts: any = {};
  for (const p of ['head','torso','left_arm','right_arm','left_leg','right_leg']) {
    parts[p] = { name: p, hp: p === 'torso' ? torsoHp : 20, max_hp: p === 'torso' ? torsoHp : 20, armor: p === 'torso' ? torsoArmor : 0, installed_components: [], status_effects: [] };
  }
  return {
    user_id: 'target', frame_card_id: 'X', parts, shield: shieldSp !== null ? { sp: shieldSp, max_sp: 20, regen: 5, resist_profile: {} } : null,
    ap: 3, ap_per_turn: 3, hand: [], deck: [], discard: [], reshuffle_count: 0, status_effects: [], is_eliminated: false, targeting_system: false
  };
}

Deno.test('damage hits shield first, overflow hits HP', () => {
  const player = makePlayer(40, 0, 10);
  const result = resolveDamage(player, 15, 'torso', 'kinetic');
  assertEquals(result.shieldDamage, 10);
  assertEquals(result.partHpDamage, 5);
  assertEquals(result.targetState.shield!.sp, 0);
  assertEquals(result.targetState.parts.torso.hp, 35);
});

Deno.test('armor absorbs damage before part HP', () => {
  const player = makePlayer(40, 8, null);
  const result = resolveDamage(player, 12, 'torso', 'kinetic');
  assertEquals(result.armorDamage, 8);
  assertEquals(result.partHpDamage, 4);
  assertEquals(result.targetState.parts.torso.armor, 0);
  assertEquals(result.targetState.parts.torso.hp, 36);
});

Deno.test('no damage when fully shielded', () => {
  const player = makePlayer(40, 0, 30);
  const result = resolveDamage(player, 10, 'torso', 'kinetic');
  assertEquals(result.partHpDamage, 0);
  assertEquals(result.targetState.parts.torso.hp, 40);
});
