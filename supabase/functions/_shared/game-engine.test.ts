import { assertEquals } from 'https://deno.land/std/assert/mod.ts';
import { buildPlayerState } from './game-engine.ts';

Deno.test('buildPlayerState sets correct base HP from frame stats', () => {
  const frameCard = {
    id: '0201-ATLAS-HVY',
    stats: {
      base_hp: { head: 25, torso: 60, left_arm: 30, right_arm: 30, left_leg: 25, right_leg: 25 },
      base_ap: 2,
      slots: { head: 1, torso: 3, left_arm: 1, right_arm: 1, left_leg: 1, right_leg: 1 }
    }
  };
  const state = buildPlayerState('user-1', frameCard, []);
  assertEquals(state.parts.torso.max_hp, 60);
  assertEquals(state.ap_per_turn, 2);
});

Deno.test('buildPlayerState shuffles and deals 5 cards to hand', () => {
  const frameCard = {
    id: '0201-ATLAS-HVY',
    stats: { base_hp: { head:25,torso:60,left_arm:30,right_arm:30,left_leg:25,right_leg:25 }, base_ap:2, slots:{} }
  };
  const deck = ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10'];
  const state = buildPlayerState('user-1', frameCard, deck);
  assertEquals(state.hand.length, 5);
  assertEquals(state.deck.length, 5);
});
