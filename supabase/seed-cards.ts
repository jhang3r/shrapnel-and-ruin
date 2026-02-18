import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cards = [
  // --- FRAMES ---
  {
    id: '0301-REAPER',
    name: 'Reaper',
    type: 'frame',
    rarity: 'rare',
    point_cost: 6,
    stats: { parts: ['head','torso','left_arm','right_arm','left_leg','right_leg'], base_hp: { head:20,torso:40,left_arm:25,right_arm:25,left_leg:20,right_leg:20 }, base_ap: 3, slots: { head:1,torso:2,left_arm:2,right_arm:2,left_leg:1,right_leg:1 } },
    discard_effect: { description: 'Gain 1 AP this turn' },
    is_starter: false
  },
  {
    id: '0201-ATLAS-HVY',
    name: 'Atlas Heavy',
    type: 'frame',
    rarity: 'uncommon',
    point_cost: 4,
    stats: { parts: ['head','torso','left_arm','right_arm','left_leg','right_leg'], base_hp: { head:25,torso:60,left_arm:30,right_arm:30,left_leg:25,right_leg:25 }, base_ap: 2, slots: { head:1,torso:3,left_arm:1,right_arm:1,left_leg:1,right_leg:1 } },
    discard_effect: { description: 'Reduce next incoming damage by 5' },
    is_starter: true
  },
  // --- COMPONENTS ---
  {
    id: 'COMP-LASER-01',
    name: 'Pulse Laser',
    type: 'component',
    rarity: 'common',
    point_cost: 1,
    stats: { slot_type: 'weapon', damage: '2d6', energy_type: 'em', part_restriction: ['left_arm','right_arm'] },
    discard_effect: { description: 'Deal 3 EM damage to a random enemy part' },
    is_starter: true
  },
  {
    id: 'COMP-SHIELD-01',
    name: 'Basic Shield Generator',
    type: 'component',
    rarity: 'common',
    point_cost: 1,
    stats: { slot_type: 'shield', shield_points: 15, regen_per_upkeep: 5, resist_profile: { kinetic: 1.0, em: 1.5, thermal: 1.0 }, part_restriction: ['torso'] },
    discard_effect: { description: 'Restore 8 shield points immediately' },
    is_starter: true
  },
  {
    id: 'COMP-TARGET-01',
    name: 'Targeting Reticle',
    type: 'component',
    rarity: 'common',
    point_cost: 1,
    stats: { slot_type: 'targeting', allows_part_targeting: true, part_restriction: ['head'] },
    discard_effect: { description: 'Your next attack ignores 3 armor' },
    is_starter: true
  },
  {
    id: 'COMP-HYDRAULIC-01',
    name: 'Hydraulic Actuator',
    type: 'component',
    rarity: 'common',
    point_cost: 1,
    stats: { slot_type: 'passive', effect: 'draw_bonus', amount: 1, part_restriction: ['left_leg','right_leg'] },
    discard_effect: { description: 'Draw 1 card immediately' },
    is_starter: true
  },
  // --- ACTIONS ---
  {
    id: 'ACT-OVERCHARGE-01',
    name: 'Overcharge',
    type: 'action',
    rarity: 'common',
    point_cost: 1,
    stats: { effect: 'gain_ap', amount: 2 },
    discard_effect: { description: 'Deal 2 thermal damage to self, gain 1 AP' },
    is_starter: true
  },
  {
    id: 'ACT-REPAIR-01',
    name: 'Field Repair',
    type: 'action',
    rarity: 'uncommon',
    point_cost: 2,
    stats: { effect: 'repair', amount: 10, target: 'self_any_part' },
    discard_effect: { description: 'Repair 4 HP to most damaged part' },
    is_starter: false
  },
  // --- ENERGY ---
  {
    id: 'NRG-CORE-01',
    name: 'Power Cell',
    type: 'energy',
    rarity: 'common',
    point_cost: 1,
    stats: { ap_grant: 1 },
    discard_effect: { description: 'Deal 2 EM damage and apply Jammed (1 turn)' },
    is_starter: true
  },
  // --- ARMOR ---
  {
    id: 'ARM-PLATE-01',
    name: 'Blast Plating',
    type: 'armor',
    rarity: 'common',
    point_cost: 1,
    stats: { armor_points: 8, part_restriction: null },
    discard_effect: { description: 'Block up to 10 incoming damage once' },
    is_starter: true
  }
];

async function seed() {
  const { error } = await supabase.from('card_definitions').upsert(cards, { onConflict: 'id' });
  if (error) { console.error(error); process.exit(1); }
  console.log(`Seeded ${cards.length} cards.`);
}

seed();
