insert into public.packs (id, name, rarity_weights) values
  ('standard', 'Standard Pack', '{"common":65,"uncommon":25,"rare":8,"epic":2,"legendary":0}'),
  ('advanced', 'Advanced Pack', '{"common":45,"uncommon":30,"rare":17,"epic":7,"legendary":1}'),
  ('elite',    'Elite Pack',    '{"common":20,"uncommon":30,"rare":30,"epic":15,"legendary":5}');

-- Card definitions: starter set
insert into public.card_definitions (id, name, type, rarity, point_cost, stats, discard_effect, is_starter) values

-- Frames
('frame-reaper',    '0301-REAPER',    'frame', 'rare',   6,
  '{"parts":{"head":{"hp":20,"slots":1},"torso":{"hp":30,"slots":2},"left_arm":{"hp":20,"slots":1},"right_arm":{"hp":20,"slots":1},"left_leg":{"hp":15,"slots":1},"right_leg":{"hp":15,"slots":1}},"base_ap":3,"ability":{"name":"Ghost Step","ap_cost":2,"effect":"dodge_35"}}',
  '{"effect":"gain_1_ap"}', true),

('frame-atlas',     '0201-ATLAS-HVY', 'frame', 'rare',   7,
  '{"parts":{"head":{"hp":25,"slots":1},"torso":{"hp":40,"slots":2},"left_arm":{"hp":25,"slots":2},"right_arm":{"hp":25,"slots":2},"left_leg":{"hp":20,"slots":1},"right_leg":{"hp":20,"slots":1}},"base_ap":2,"ability":{"name":"Armor Lock","ap_cost":2,"effect":"damage_reduction_50"}}',
  '{"effect":"gain_2_armor"}', true),

('frame-scout',     '0101-SCOUT',     'frame', 'common', 4,
  '{"parts":{"head":{"hp":15,"slots":1},"torso":{"hp":20,"slots":1},"left_arm":{"hp":15,"slots":1},"right_arm":{"hp":15,"slots":1},"left_leg":{"hp":10,"slots":1},"right_leg":{"hp":10,"slots":1}},"base_ap":3,"ability":{"name":"Boost","ap_cost":1,"effect":"gain_1_ap"}}',
  '{"effect":"draw_1"}', true),

-- Components: Weapons
('comp-autocannon', 'Autocannon',        'component', 'common',   2,
  '{"slot_type":"weapon","damage":"2d6","energy_type":"kinetic","target":"any_part"}',
  '{"effect":"gain_1_ap"}', true),

('comp-plasma-rifle','Plasma Rifle',     'component', 'uncommon', 3,
  '{"slot_type":"weapon","damage":"3d6","energy_type":"thermal","target":"any_part","status":{"type":"burning","duration":2,"value":3}}',
  '{"effect":"deal_3_damage"}', true),

('comp-rail-cannon', 'Rail Cannon',      'component', 'rare',     5,
  '{"slot_type":"weapon","damage":"4d6","energy_type":"kinetic","target":"any_part"}',
  '{"effect":"deal_6_damage"}', false),

('comp-emp-burst',   'EMP Burst',        'component', 'uncommon', 3,
  '{"slot_type":"weapon","damage":"1d6","energy_type":"em","target":"any_part","status":{"type":"emped","duration":2}}',
  '{"effect":"disrupt_enemy"}', false),

-- Components: Shields
('comp-shield-gen',  'Shield Generator', 'component', 'uncommon', 3,
  '{"slot_type":"shield","sp":20,"regen":5,"resist":{"kinetic":0.5,"em":1.5,"thermal":1.0}}',
  '{"effect":"block_5_damage"}', true),

('comp-heavy-shield','Heavy Shield',     'component', 'rare',     5,
  '{"slot_type":"shield","sp":35,"regen":8,"resist":{"kinetic":0.25,"em":2.0,"thermal":1.0}}',
  '{"effect":"block_10_damage"}', false),

-- Components: Targeting
('comp-targeting',   'Targeting System', 'component', 'common',   2,
  '{"slot_type":"targeting","effect":"choose_part"}',
  '{"effect":"mark_enemy"}', true),

-- Components: Legs (passive)
('comp-hydraulic',   'Hydraulic Actuator','component','common',   2,
  '{"slot_type":"leg","passive":"draw_1_per_upkeep"}',
  '{"effect":"draw_1"}', true),

('comp-power-relay', 'Power Relay',      'component', 'common',   2,
  '{"slot_type":"leg","passive":"ap_plus_1"}',
  '{"effect":"gain_1_ap"}', true),

('comp-overdrive',   'Overdrive Capacitor','component','uncommon', 3,
  '{"slot_type":"leg","passive":"ap_plus_2","cost":"3_damage_per_upkeep"}',
  '{"effect":"gain_2_ap"}', false),

-- Components: Repair
('comp-repair-drone','Repair Drone',     'component', 'uncommon', 3,
  '{"slot_type":"core","effect":"repairing","value":5,"duration":3}',
  '{"effect":"heal_5"}', false),

-- Action cards
('act-overclock',    'Weapon Overclock', 'action', 'common',   1,
  '{"effect":"next_attack_plus_20_pct"}',
  '{"effect":"gain_1_ap"}', true),

('act-emergency-rep','Emergency Repair', 'action', 'common',   2,
  '{"effect":"heal_15","target":"self"}',
  '{"effect":"heal_5"}', true),

('act-shield-boost', 'Shield Boost',     'action', 'common',   1,
  '{"effect":"shield_regen_doubled"}',
  '{"effect":"block_3_damage"}', true),

('act-salvage-op',   'Salvage Op',       'action', 'uncommon', 2,
  '{"effect":"draw_3"}',
  '{"effect":"draw_1"}', false),

('act-countermeasure','Countermeasures', 'action', 'uncommon', 2,
  '{"effect":"dodge_25_this_turn"}',
  '{"effect":"block_5_damage"}', false),

('act-overload',     'System Overload',  'action', 'rare',     4,
  '{"effect":"deal_10_damage_all_enemies"}',
  '{"effect":"deal_3_damage"}', false),

-- Energy cards
('eng-capacitor',    'Capacitor Cell',   'energy', 'common',   1,
  '{"ap_gain":1}',
  '{"effect":"kinetic_burst","damage":"1d4"}', true),

('eng-fusion-cell',  'Fusion Cell',      'energy', 'common',   1,
  '{"ap_gain":2}',
  '{"effect":"thermal_burst","damage":"1d6","status":{"type":"burning","duration":1,"value":2}}', true),

('eng-em-coil',      'EM Coil',          'energy', 'uncommon', 2,
  '{"ap_gain":2}',
  '{"effect":"em_burst","status":{"type":"emped","duration":1}}', false),

('eng-overcharge',   'Overcharge',       'energy', 'rare',     3,
  '{"ap_gain":3}',
  '{"effect":"energized","bonus_ap":1}', false),

-- Armor cards
('arm-plating-light','Light Plating',    'armor', 'common',   1,
  '{"armor_points":5,"target_part":"any"}',
  '{"effect":"block_3_damage"}', true),

('arm-plating-heavy','Heavy Plating',    'armor', 'common',   2,
  '{"armor_points":10,"target_part":"any"}',
  '{"effect":"block_6_damage"}', true),

('arm-reactive',     'Reactive Armor',   'armor', 'uncommon', 3,
  '{"armor_points":8,"target_part":"any","on_hit":"deal_2_damage_attacker"}',
  '{"effect":"block_8_damage"}', false),

('arm-ablative',     'Ablative Shield',  'armor', 'rare',     4,
  '{"armor_points":15,"target_part":"torso"}',
  '{"effect":"block_10_damage"}', false);
