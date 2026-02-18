insert into public.packs (id, name, rarity_weights) values
  ('standard', 'Standard Pack', '{"common":65,"uncommon":25,"rare":8,"epic":2,"legendary":0}'),
  ('advanced', 'Advanced Pack', '{"common":45,"uncommon":30,"rare":17,"epic":7,"legendary":1}'),
  ('elite',    'Elite Pack',    '{"common":20,"uncommon":30,"rare":30,"epic":15,"legendary":5}');

-- Card definitions: full 200-card set
insert into public.card_definitions (id, name, type, rarity, point_cost, stats, discard_effect, is_starter) values

-- ============================================================
-- FRAMES (20 total: 3 common, 5 uncommon, 7 rare, 4 epic, 1 legendary)
-- ============================================================

-- Frames: Common (3)
('frame-scout',     '0101-SCOUT',     'frame', 'common', 4,
  '{"parts":{"head":{"hp":15,"slots":1},"torso":{"hp":20,"slots":1},"left_arm":{"hp":15,"slots":1},"right_arm":{"hp":15,"slots":1},"left_leg":{"hp":10,"slots":1},"right_leg":{"hp":10,"slots":1}},"base_ap":3,"ability":{"name":"Boost","ap_cost":1,"effect":"gain_1_ap"}}',
  '{"effect":"draw_1"}', true),

('frame-grunt',     '0102-GRUNT',     'frame', 'common', 3,
  '{"parts":{"head":{"hp":18,"slots":1},"torso":{"hp":25,"slots":2},"left_arm":{"hp":18,"slots":1},"right_arm":{"hp":18,"slots":1},"left_leg":{"hp":12,"slots":1},"right_leg":{"hp":12,"slots":1}},"base_ap":2,"ability":{"name":"Brace","ap_cost":1,"effect":"block_5_damage"}}',
  '{"effect":"gain_1_ap"}', true),

('frame-runner',    '0103-RUNNER',    'frame', 'common', 3,
  '{"parts":{"head":{"hp":12,"slots":1},"torso":{"hp":18,"slots":1},"left_arm":{"hp":12,"slots":1},"right_arm":{"hp":12,"slots":1},"left_leg":{"hp":14,"slots":2},"right_leg":{"hp":14,"slots":2}},"base_ap":4,"ability":{"name":"Sprint","ap_cost":2,"effect":"dodge_20"}}',
  '{"effect":"draw_1"}', true),

-- Frames: Uncommon (5)
('frame-warden',    '0201-WARDEN',    'frame', 'uncommon', 4,
  '{"parts":{"head":{"hp":20,"slots":1},"torso":{"hp":30,"slots":2},"left_arm":{"hp":22,"slots":2},"right_arm":{"hp":22,"slots":1},"left_leg":{"hp":18,"slots":1},"right_leg":{"hp":18,"slots":1}},"base_ap":3,"ability":{"name":"Guard Stance","ap_cost":2,"effect":"damage_reduction_25"}}',
  '{"effect":"block_5_damage"}', true),

('frame-striker',   '0202-STRIKER',   'frame', 'uncommon', 4,
  '{"parts":{"head":{"hp":16,"slots":1},"torso":{"hp":22,"slots":2},"left_arm":{"hp":18,"slots":2},"right_arm":{"hp":18,"slots":2},"left_leg":{"hp":12,"slots":1},"right_leg":{"hp":12,"slots":1}},"base_ap":3,"ability":{"name":"Combat Rush","ap_cost":1,"effect":"next_attack_plus_15_pct"}}',
  '{"effect":"gain_1_ap"}', false),

('frame-bulwark',   '0203-BULWARK',   'frame', 'uncommon', 4,
  '{"parts":{"head":{"hp":22,"slots":1},"torso":{"hp":35,"slots":3},"left_arm":{"hp":22,"slots":1},"right_arm":{"hp":22,"slots":1},"left_leg":{"hp":20,"slots":1},"right_leg":{"hp":20,"slots":1}},"base_ap":2,"ability":{"name":"Fortify","ap_cost":2,"effect":"gain_5_armor_all_parts"}}',
  '{"effect":"gain_2_armor"}', true),

('frame-phantom',   '0204-PHANTOM',   'frame', 'uncommon', 4,
  '{"parts":{"head":{"hp":14,"slots":2},"torso":{"hp":18,"slots":1},"left_arm":{"hp":14,"slots":1},"right_arm":{"hp":14,"slots":1},"left_leg":{"hp":10,"slots":1},"right_leg":{"hp":10,"slots":1}},"base_ap":4,"ability":{"name":"Cloak","ap_cost":2,"effect":"dodge_40_one_turn"}}',
  '{"effect":"draw_1"}', false),

('frame-corvette',  '0205-CORVETTE',  'frame', 'uncommon', 3,
  '{"parts":{"head":{"hp":15,"slots":2},"torso":{"hp":20,"slots":2},"left_arm":{"hp":15,"slots":2},"right_arm":{"hp":15,"slots":2},"left_leg":{"hp":12,"slots":1},"right_leg":{"hp":12,"slots":1}},"base_ap":3,"ability":{"name":"Rapid Fire","ap_cost":2,"effect":"attack_twice_minus_30_pct"}}',
  '{"effect":"deal_2_damage"}', false),

-- Frames: Rare (7)
('frame-reaper',    '0301-REAPER',    'frame', 'rare',   6,
  '{"parts":{"head":{"hp":20,"slots":1},"torso":{"hp":30,"slots":2},"left_arm":{"hp":20,"slots":1},"right_arm":{"hp":20,"slots":1},"left_leg":{"hp":15,"slots":1},"right_leg":{"hp":15,"slots":1}},"base_ap":3,"ability":{"name":"Ghost Step","ap_cost":2,"effect":"dodge_35"}}',
  '{"effect":"gain_1_ap"}', true),

('frame-atlas',     '0201-ATLAS-HVY', 'frame', 'rare',   7,
  '{"parts":{"head":{"hp":25,"slots":1},"torso":{"hp":40,"slots":2},"left_arm":{"hp":25,"slots":2},"right_arm":{"hp":25,"slots":2},"left_leg":{"hp":20,"slots":1},"right_leg":{"hp":20,"slots":1}},"base_ap":2,"ability":{"name":"Armor Lock","ap_cost":2,"effect":"damage_reduction_50"}}',
  '{"effect":"gain_2_armor"}', true),

('frame-paladin',   '0302-PALADIN',   'frame', 'rare',   6,
  '{"parts":{"head":{"hp":28,"slots":1},"torso":{"hp":42,"slots":3},"left_arm":{"hp":28,"slots":2},"right_arm":{"hp":28,"slots":2},"left_leg":{"hp":22,"slots":1},"right_leg":{"hp":22,"slots":1}},"base_ap":2,"ability":{"name":"Shield Wall","ap_cost":3,"effect":"negate_next_attack"}}',
  '{"effect":"gain_3_armor"}', false),

('frame-viper',     '0303-VIPER',     'frame', 'rare',   5,
  '{"parts":{"head":{"hp":18,"slots":2},"torso":{"hp":24,"slots":2},"left_arm":{"hp":18,"slots":2},"right_arm":{"hp":18,"slots":2},"left_leg":{"hp":14,"slots":1},"right_leg":{"hp":14,"slots":1}},"base_ap":4,"ability":{"name":"Poison Strike","ap_cost":2,"effect":"apply_corroded_3"}}',
  '{"effect":"deal_4_damage"}', false),

('frame-goliath',   '0304-GOLIATH',   'frame', 'rare',   6,
  '{"parts":{"head":{"hp":30,"slots":1},"torso":{"hp":50,"slots":2},"left_arm":{"hp":30,"slots":2},"right_arm":{"hp":30,"slots":2},"left_leg":{"hp":25,"slots":1},"right_leg":{"hp":25,"slots":1}},"base_ap":2,"ability":{"name":"Stomp","ap_cost":3,"effect":"stun_enemy_1_turn"}}',
  '{"effect":"deal_5_damage"}', false),

('frame-spectre',   '0305-SPECTRE',   'frame', 'rare',   5,
  '{"parts":{"head":{"hp":16,"slots":2},"torso":{"hp":20,"slots":2},"left_arm":{"hp":16,"slots":2},"right_arm":{"hp":16,"slots":2},"left_leg":{"hp":12,"slots":2},"right_leg":{"hp":12,"slots":2}},"base_ap":4,"ability":{"name":"Phase Shift","ap_cost":3,"effect":"untargetable_1_turn"}}',
  '{"effect":"draw_2"}', false),

('frame-templar',   '0306-TEMPLAR',   'frame', 'rare',   6,
  '{"parts":{"head":{"hp":24,"slots":2},"torso":{"hp":36,"slots":3},"left_arm":{"hp":24,"slots":2},"right_arm":{"hp":24,"slots":2},"left_leg":{"hp":20,"slots":1},"right_leg":{"hp":20,"slots":1}},"base_ap":3,"ability":{"name":"Holy Flame","ap_cost":2,"effect":"apply_burning_2_all_enemies"}}',
  '{"effect":"deal_3_damage"}', false),

-- Frames: Epic (4)
('frame-colossus',  '0401-COLOSSUS',  'frame', 'epic',   7,
  '{"parts":{"head":{"hp":35,"slots":2},"torso":{"hp":60,"slots":4},"left_arm":{"hp":35,"slots":3},"right_arm":{"hp":35,"slots":3},"left_leg":{"hp":30,"slots":2},"right_leg":{"hp":30,"slots":2}},"base_ap":2,"ability":{"name":"Titan Crush","ap_cost":4,"effect":"deal_20_damage_ignore_shield"}}',
  '{"effect":"deal_8_damage"}', false),

('frame-wraith',    '0402-WRAITH',    'frame', 'epic',   8,
  '{"parts":{"head":{"hp":20,"slots":2},"torso":{"hp":28,"slots":2},"left_arm":{"hp":20,"slots":3},"right_arm":{"hp":20,"slots":3},"left_leg":{"hp":16,"slots":2},"right_leg":{"hp":16,"slots":2}},"base_ap":5,"ability":{"name":"Shadow Blade","ap_cost":3,"effect":"attack_from_stealth_plus_50_pct"}}',
  '{"effect":"draw_3"}', false),

('frame-ironclad',  '0403-IRONCLAD',  'frame', 'epic',   8,
  '{"parts":{"head":{"hp":40,"slots":2},"torso":{"hp":65,"slots":3},"left_arm":{"hp":40,"slots":2},"right_arm":{"hp":40,"slots":2},"left_leg":{"hp":35,"slots":1},"right_leg":{"hp":35,"slots":1}},"base_ap":2,"ability":{"name":"Iron Bastion","ap_cost":4,"effect":"damage_reduction_75_one_turn"}}',
  '{"effect":"gain_5_armor"}', false),

('frame-nova',      '0404-NOVA',      'frame', 'epic',   7,
  '{"parts":{"head":{"hp":22,"slots":2},"torso":{"hp":32,"slots":3},"left_arm":{"hp":22,"slots":2},"right_arm":{"hp":22,"slots":2},"left_leg":{"hp":18,"slots":2},"right_leg":{"hp":18,"slots":2}},"base_ap":4,"ability":{"name":"Plasma Nova","ap_cost":4,"effect":"deal_15_thermal_damage_all_enemies"}}',
  '{"effect":"deal_6_damage"}', false),

-- Frames: Legendary (1)
('frame-ouroboros', '0501-OUROBOROS', 'frame', 'legendary', 10,
  '{"parts":{"head":{"hp":45,"slots":3},"torso":{"hp":70,"slots":5},"left_arm":{"hp":45,"slots":4},"right_arm":{"hp":45,"slots":4},"left_leg":{"hp":40,"slots":3},"right_leg":{"hp":40,"slots":3}},"base_ap":5,"ability":{"name":"Rebirth Protocol","ap_cost":5,"effect":"restore_20_pct_hp_all_parts_draw_3"}}',
  '{"effect":"gain_3_ap"}', false),

-- ============================================================
-- COMPONENTS (60 total: 18 common, 18 uncommon, 14 rare, 8 epic, 2 legendary)
-- ============================================================

-- Components: Weapons - Common (6)
('comp-autocannon', 'Autocannon',        'component', 'common',   2,
  '{"slot_type":"weapon","damage":"2d6","energy_type":"kinetic","target":"any_part"}',
  '{"effect":"gain_1_ap"}', true),

('comp-burst-rifle', 'Burst Rifle',      'component', 'common',   2,
  '{"slot_type":"weapon","damage":"2d4","energy_type":"kinetic","target":"any_part"}',
  '{"effect":"deal_2_damage"}', true),

('comp-flamethrower-sm','Flamethrower Mk1','component','common',  2,
  '{"slot_type":"weapon","damage":"1d6","energy_type":"thermal","target":"any_part","status":{"type":"burning","duration":1,"value":2}}',
  '{"effect":"deal_2_damage"}', true),

('comp-stun-baton',  'Stun Baton',       'component', 'common',   1,
  '{"slot_type":"weapon","damage":"1d4","energy_type":"em","target":"any_part","status":{"type":"stunned","duration":1}}',
  '{"effect":"gain_1_ap"}', true),

('comp-acid-sprayer','Acid Sprayer',     'component', 'common',   2,
  '{"slot_type":"weapon","damage":"1d6","energy_type":"chemical","target":"any_part","status":{"type":"corroded","duration":2,"value":1}}',
  '{"effect":"deal_2_damage"}', true),

('comp-machine-gun', 'Machine Gun',      'component', 'common',   2,
  '{"slot_type":"weapon","damage":"3d4","energy_type":"kinetic","target":"any_part"}',
  '{"effect":"deal_3_damage"}', true),

-- Components: Shields - Common (3)
('comp-buckler-shield','Buckler Shield', 'component', 'common',   1,
  '{"slot_type":"shield","sp":10,"regen":2,"resist":{"kinetic":1.0,"em":1.0,"thermal":1.0}}',
  '{"effect":"block_3_damage"}', true),

('comp-kinetic-screen','Kinetic Screen', 'component', 'common',   2,
  '{"slot_type":"shield","sp":15,"regen":3,"resist":{"kinetic":0.5,"em":1.5,"thermal":1.5}}',
  '{"effect":"block_5_damage"}', true),

('comp-thermal-shield','Thermal Shield', 'component', 'common',   2,
  '{"slot_type":"shield","sp":15,"regen":3,"resist":{"kinetic":1.5,"em":1.5,"thermal":0.5}}',
  '{"effect":"block_5_damage"}', true),

-- Components: Targeting - Common (2)
('comp-targeting',   'Targeting System', 'component', 'common',   2,
  '{"slot_type":"targeting","effect":"choose_part"}',
  '{"effect":"mark_enemy"}', true),

('comp-laser-sight', 'Laser Sight',      'component', 'common',   1,
  '{"slot_type":"targeting","effect":"choose_part","bonus":"plus_10_pct_damage"}',
  '{"effect":"gain_1_ap"}', true),

-- Components: Legs - Common (4)
('comp-hydraulic',   'Hydraulic Actuator','component','common',   2,
  '{"slot_type":"leg","passive":"draw_1_per_upkeep"}',
  '{"effect":"draw_1"}', true),

('comp-power-relay', 'Power Relay',      'component', 'common',   2,
  '{"slot_type":"leg","passive":"ap_plus_1"}',
  '{"effect":"gain_1_ap"}', true),

('comp-servo-legs',  'Servo Legs',       'component', 'common',   1,
  '{"slot_type":"leg","passive":"dodge_plus_5"}',
  '{"effect":"draw_1"}', true),

('comp-stabilizer',  'Stabilizer Unit',  'component', 'common',   1,
  '{"slot_type":"leg","passive":"reduce_self_stagger"}',
  '{"effect":"gain_1_ap"}', true),

-- Components: Core - Common (3)
('comp-basic-reactor','Basic Reactor',   'component', 'common',   2,
  '{"slot_type":"core","effect":"ap_regen","value":1}',
  '{"effect":"gain_1_ap"}', true),

('comp-repair-kit',  'Field Repair Kit', 'component', 'common',   2,
  '{"slot_type":"core","effect":"heal_on_upkeep","value":3}',
  '{"effect":"heal_5"}', true),

('comp-data-core',   'Data Core',        'component', 'common',   1,
  '{"slot_type":"core","effect":"draw_on_upkeep","value":1}',
  '{"effect":"draw_1"}', true),

-- Components: Weapons - Uncommon (5)
('comp-plasma-rifle','Plasma Rifle',     'component', 'uncommon', 3,
  '{"slot_type":"weapon","damage":"3d6","energy_type":"thermal","target":"any_part","status":{"type":"burning","duration":2,"value":3}}',
  '{"effect":"deal_3_damage"}', true),

('comp-emp-burst',   'EMP Burst',        'component', 'uncommon', 3,
  '{"slot_type":"weapon","damage":"1d6","energy_type":"em","target":"any_part","status":{"type":"emped","duration":2}}',
  '{"effect":"disrupt_enemy"}', false),

('comp-scatter-cannon','Scatter Cannon', 'component', 'uncommon', 3,
  '{"slot_type":"weapon","damage":"2d6","energy_type":"kinetic","target":"any_part","hits":2}',
  '{"effect":"deal_4_damage"}', false),

('comp-neural-disruptor','Neural Disruptor','component','uncommon',3,
  '{"slot_type":"weapon","damage":"2d4","energy_type":"em","target":"head","status":{"type":"disrupted","duration":2}}',
  '{"effect":"disrupt_enemy"}', false),

('comp-incendiary-launcher','Incendiary Launcher','component','uncommon',3,
  '{"slot_type":"weapon","damage":"2d6","energy_type":"thermal","target":"any_part","status":{"type":"burning","duration":3,"value":2}}',
  '{"effect":"deal_3_damage"}', false),

-- Components: Shields - Uncommon (4)
('comp-shield-gen',  'Shield Generator', 'component', 'uncommon', 3,
  '{"slot_type":"shield","sp":20,"regen":5,"resist":{"kinetic":0.5,"em":1.5,"thermal":1.0}}',
  '{"effect":"block_5_damage"}', true),

('comp-em-shield',   'EM Shield',        'component', 'uncommon', 3,
  '{"slot_type":"shield","sp":18,"regen":4,"resist":{"kinetic":1.5,"em":0.25,"thermal":1.5}}',
  '{"effect":"block_5_damage"}', false),

('comp-reactive-buckler','Reactive Buckler','component','uncommon',3,
  '{"slot_type":"shield","sp":22,"regen":5,"resist":{"kinetic":0.75,"em":1.0,"thermal":0.75},"on_hit":"deal_3_damage_attacker"}',
  '{"effect":"block_6_damage"}', false),

('comp-ablative-screen','Ablative Screen','component','uncommon', 4,
  '{"slot_type":"shield","sp":25,"regen":0,"resist":{"kinetic":0.5,"em":1.0,"thermal":0.5}}',
  '{"effect":"block_8_damage"}', false),

-- Components: Targeting - Uncommon (2)
('comp-smart-scope', 'Smart Scope',      'component', 'uncommon', 3,
  '{"slot_type":"targeting","effect":"choose_part","bonus":"plus_20_pct_damage"}',
  '{"effect":"mark_enemy"}', false),

('comp-predictive-ai','Predictive AI',   'component', 'uncommon', 3,
  '{"slot_type":"targeting","effect":"choose_part","bonus":"ignore_25_pct_armor"}',
  '{"effect":"draw_1"}', false),

-- Components: Legs - Uncommon (3)
('comp-overdrive',   'Overdrive Capacitor','component','uncommon', 3,
  '{"slot_type":"leg","passive":"ap_plus_2","cost":"3_damage_per_upkeep"}',
  '{"effect":"gain_2_ap"}', false),

('comp-jump-jets',   'Jump Jets',        'component', 'uncommon', 3,
  '{"slot_type":"leg","passive":"dodge_plus_15","cost":"1_ap_per_upkeep"}',
  '{"effect":"draw_1"}', false),

('comp-sprint-booster','Sprint Booster', 'component', 'uncommon', 3,
  '{"slot_type":"leg","passive":"ap_plus_1","bonus":"first_ap_each_turn_free"}',
  '{"effect":"gain_1_ap"}', false),

-- Components: Core - Uncommon (4)
('comp-repair-drone','Repair Drone',     'component', 'uncommon', 3,
  '{"slot_type":"core","effect":"repairing","value":5,"duration":3}',
  '{"effect":"heal_5"}', false),

('comp-recycler',    'Scrap Recycler',   'component', 'uncommon', 2,
  '{"slot_type":"core","effect":"on_discard_gain_1_ap"}',
  '{"effect":"gain_1_ap"}', false),

('comp-coolant-pump','Coolant Pump',     'component', 'uncommon', 3,
  '{"slot_type":"core","effect":"remove_burning_on_upkeep","value":3}',
  '{"effect":"remove_status_burning"}', false),

('comp-battle-computer','Battle Computer','component','uncommon',  4,
  '{"slot_type":"core","effect":"draw_on_upkeep","value":2}',
  '{"effect":"draw_2"}', false),

-- Components: Weapons - Rare (5)
('comp-rail-cannon', 'Rail Cannon',      'component', 'rare',     5,
  '{"slot_type":"weapon","damage":"4d6","energy_type":"kinetic","target":"any_part"}',
  '{"effect":"deal_6_damage"}', false),

('comp-plasma-cannon','Plasma Cannon',   'component', 'rare',     5,
  '{"slot_type":"weapon","damage":"4d8","energy_type":"thermal","target":"any_part","status":{"type":"burning","duration":3,"value":5}}',
  '{"effect":"deal_8_damage"}', false),

('comp-ion-lance',   'Ion Lance',        'component', 'rare',     5,
  '{"slot_type":"weapon","damage":"3d8","energy_type":"em","target":"any_part","status":{"type":"emped","duration":3}}',
  '{"effect":"deal_6_damage"}', false),

('comp-chem-sprayer','Chemical Sprayer', 'component', 'rare',     4,
  '{"slot_type":"weapon","damage":"3d6","energy_type":"chemical","target":"any_part","status":{"type":"corroded","duration":3,"value":3}}',
  '{"effect":"deal_5_damage"}', false),

('comp-siege-cannon','Siege Cannon',     'component', 'rare',     6,
  '{"slot_type":"weapon","damage":"5d6","energy_type":"kinetic","target":"any_part","reload":1}',
  '{"effect":"deal_8_damage"}', false),

-- Components: Shields - Rare (3)
('comp-heavy-shield','Heavy Shield',     'component', 'rare',     5,
  '{"slot_type":"shield","sp":35,"regen":8,"resist":{"kinetic":0.25,"em":2.0,"thermal":1.0}}',
  '{"effect":"block_10_damage"}', false),

('comp-fortress-screen','Fortress Screen','component','rare',      5,
  '{"slot_type":"shield","sp":40,"regen":6,"resist":{"kinetic":0.5,"em":1.0,"thermal":0.5}}',
  '{"effect":"block_12_damage"}', false),

('comp-thermal-barrier','Thermal Barrier','component','rare',      5,
  '{"slot_type":"shield","sp":30,"regen":10,"resist":{"kinetic":1.5,"em":1.5,"thermal":0.1}}',
  '{"effect":"block_10_damage"}', false),

-- Components: Core - Rare (4)
('comp-fusion-core', 'Fusion Core',      'component', 'rare',     5,
  '{"slot_type":"core","effect":"ap_regen","value":2}',
  '{"effect":"gain_2_ap"}', false),

('comp-nanite-swarm','Nanite Swarm',     'component', 'rare',     5,
  '{"slot_type":"core","effect":"heal_on_upkeep","value":8}',
  '{"effect":"heal_10"}', false),

('comp-targeting-matrix','Targeting Matrix','component','rare',    5,
  '{"slot_type":"core","effect":"all_weapons_plus_15_pct_damage"}',
  '{"effect":"deal_5_damage"}', false),

('comp-overcharge-core','Overcharge Core','component','rare',      6,
  '{"slot_type":"core","effect":"ap_regen","value":3,"cost":"overheat_1_per_upkeep"}',
  '{"effect":"gain_3_ap"}', false),

-- Components: Targeting - Rare (2)
('comp-neural-scope','Neural Scope',     'component', 'rare',     4,
  '{"slot_type":"targeting","effect":"choose_part","bonus":"plus_30_pct_damage"}',
  '{"effect":"draw_2"}', false),

('comp-quantum-aim', 'Quantum Aim',      'component', 'rare',     5,
  '{"slot_type":"targeting","effect":"choose_part","bonus":"attack_twice_at_full_power"}',
  '{"effect":"mark_enemy"}', false),

-- Components: Weapons - Epic (4)
('comp-antimatter-cannon','Antimatter Cannon','component','epic',  7,
  '{"slot_type":"weapon","damage":"6d8","energy_type":"kinetic","target":"any_part"}',
  '{"effect":"deal_12_damage"}', false),

('comp-hellfire-array','Hellfire Array', 'component', 'epic',     7,
  '{"slot_type":"weapon","damage":"5d8","energy_type":"thermal","target":"any_part","hits":2,"status":{"type":"burning","duration":3,"value":6}}',
  '{"effect":"deal_10_damage"}', false),

('comp-void-lance',  'Void Lance',       'component', 'epic',     8,
  '{"slot_type":"weapon","damage":"6d8","energy_type":"em","target":"any_part","status":{"type":"emped","duration":4},"bonus":"ignore_shields"}',
  '{"effect":"deal_12_damage"}', false),

('comp-neurotoxin-cannon','Neurotoxin Cannon','component','epic',  6,
  '{"slot_type":"weapon","damage":"4d8","energy_type":"chemical","target":"any_part","status":{"type":"corroded","duration":4,"value":5}}',
  '{"effect":"deal_8_damage"}', false),

-- Components: Shields - Epic (2)
('comp-aegis-shield','Aegis Shield',     'component', 'epic',     7,
  '{"slot_type":"shield","sp":55,"regen":12,"resist":{"kinetic":0.25,"em":0.25,"thermal":0.25}}',
  '{"effect":"block_15_damage"}', false),

('comp-mirror-field','Mirror Field',     'component', 'epic',     8,
  '{"slot_type":"shield","sp":45,"regen":10,"resist":{"kinetic":0.5,"em":0.5,"thermal":0.5},"on_hit":"reflect_25_pct_damage"}',
  '{"effect":"block_15_damage"}', false),

-- Components: Core - Epic (2)
('comp-singularity-core','Singularity Core','component','epic',   8,
  '{"slot_type":"core","effect":"all_weapons_plus_30_pct_damage","bonus":"ap_regen_1"}',
  '{"effect":"gain_3_ap"}', false),

('comp-omega-reactor','Omega Reactor',   'component', 'epic',     7,
  '{"slot_type":"core","effect":"ap_regen","value":4,"bonus":"heal_on_upkeep_5"}',
  '{"effect":"gain_4_ap"}', false),

-- Components: Legendary (2)
('comp-god-cannon',  'God Cannon',       'component', 'legendary',10,
  '{"slot_type":"weapon","damage":"8d10","energy_type":"kinetic","target":"any_part","bonus":"ignore_shields_armor"}',
  '{"effect":"deal_20_damage"}', false),

('comp-eternal-core','Eternal Core',     'component', 'legendary', 9,
  '{"slot_type":"core","effect":"ap_regen","value":5,"bonus":"heal_on_upkeep_10_draw_on_upkeep_1"}',
  '{"effect":"gain_5_ap"}', false),

-- ============================================================
-- ACTIONS (40 total: 14 common, 12 uncommon, 8 rare, 4 epic, 2 legendary)
-- ============================================================

-- Actions: Common (14)
('act-overclock',    'Weapon Overclock', 'action', 'common',   1,
  '{"effect":"next_attack_plus_20_pct"}',
  '{"effect":"gain_1_ap"}', true),

('act-emergency-rep','Emergency Repair', 'action', 'common',   2,
  '{"effect":"heal_15","target":"self"}',
  '{"effect":"heal_5"}', true),

('act-shield-boost', 'Shield Boost',     'action', 'common',   1,
  '{"effect":"shield_regen_doubled"}',
  '{"effect":"block_3_damage"}', true),

('act-scan',         'Sensor Sweep',     'action', 'common',   1,
  '{"effect":"draw_1"}',
  '{"effect":"gain_1_ap"}', true),

('act-patch',        'Field Patch',      'action', 'common',   1,
  '{"effect":"heal_8","target":"any_part"}',
  '{"effect":"heal_3"}', true),

('act-brace',        'Brace for Impact', 'action', 'common',   1,
  '{"effect":"block_8_damage_next_hit"}',
  '{"effect":"block_3_damage"}', true),

('act-vent',         'Heat Vent',        'action', 'common',   1,
  '{"effect":"remove_status_overheated"}',
  '{"effect":"gain_1_ap"}', true),

('act-reload',       'Emergency Reload', 'action', 'common',   1,
  '{"effect":"reset_weapon_reload"}',
  '{"effect":"gain_1_ap"}', true),

('act-cooldown',     'System Cooldown',  'action', 'common',   2,
  '{"effect":"remove_status_burning_overheated"}',
  '{"effect":"draw_1"}', true),

('act-jink',         'Jinking Maneuver', 'action', 'common',   1,
  '{"effect":"dodge_15_this_turn"}',
  '{"effect":"gain_1_ap"}', true),

('act-focus',        'Target Focus',     'action', 'common',   2,
  '{"effect":"next_attack_plus_30_pct"}',
  '{"effect":"mark_enemy"}', true),

('act-scavenge',     'Scavenge Parts',   'action', 'common',   1,
  '{"effect":"heal_5","target":"random_part"}',
  '{"effect":"draw_1"}', true),

('act-datalink',     'Datalink Burst',   'action', 'common',   2,
  '{"effect":"draw_2"}',
  '{"effect":"gain_1_ap"}', true),

('act-hull-patch',   'Hull Patch',       'action', 'common',   2,
  '{"effect":"heal_12","target":"torso"}',
  '{"effect":"heal_5"}', true),

-- Actions: Uncommon (12)
('act-salvage-op',   'Salvage Op',       'action', 'uncommon', 2,
  '{"effect":"draw_3"}',
  '{"effect":"draw_1"}', false),

('act-countermeasure','Countermeasures', 'action', 'uncommon', 2,
  '{"effect":"dodge_25_this_turn"}',
  '{"effect":"block_5_damage"}', false),

('act-power-surge',  'Power Surge',      'action', 'uncommon', 3,
  '{"effect":"gain_2_ap"}',
  '{"effect":"gain_1_ap"}', false),

('act-flare',        'Decoy Flare',      'action', 'uncommon', 2,
  '{"effect":"dodge_35_this_turn"}',
  '{"effect":"draw_1"}', false),

('act-suppress',     'Suppression Fire', 'action', 'uncommon', 3,
  '{"effect":"enemy_minus_2_ap_next_turn"}',
  '{"effect":"deal_2_damage"}', false),

('act-repair-wave',  'Repair Wave',      'action', 'uncommon', 3,
  '{"effect":"heal_20","target":"self"}',
  '{"effect":"heal_8"}', false),

('act-emp-pulse',    'EMP Pulse',        'action', 'uncommon', 3,
  '{"effect":"apply_emped_2_turns"}',
  '{"effect":"disrupt_enemy"}', false),

('act-onslaught',    'Onslaught Protocol','action','uncommon', 3,
  '{"effect":"next_3_attacks_plus_15_pct"}',
  '{"effect":"gain_1_ap"}', false),

('act-disengage',    'Disengage Burst',  'action', 'uncommon', 2,
  '{"effect":"dodge_30_draw_1"}',
  '{"effect":"draw_1"}', false),

('act-mark-target',  'Mark Target',      'action', 'uncommon', 2,
  '{"effect":"apply_marked_3_turns"}',
  '{"effect":"mark_enemy"}', false),

('act-field-surgery','Field Surgery',    'action', 'uncommon', 4,
  '{"effect":"heal_25","target":"any_part"}',
  '{"effect":"heal_10"}', false),

('act-system-purge', 'System Purge',     'action', 'uncommon', 3,
  '{"effect":"remove_all_negative_status"}',
  '{"effect":"draw_1"}', false),

-- Actions: Rare (8)
('act-overload',     'System Overload',  'action', 'rare',     4,
  '{"effect":"deal_10_damage_all_enemies"}',
  '{"effect":"deal_3_damage"}', false),

('act-full-repair',  'Full Repair',      'action', 'rare',     5,
  '{"effect":"heal_30","target":"self_all_parts"}',
  '{"effect":"heal_15"}', false),

('act-blitz',        'Blitz Protocol',   'action', 'rare',     4,
  '{"effect":"gain_4_ap"}',
  '{"effect":"gain_2_ap"}', false),

('act-chain-lightning','Chain Lightning','action', 'rare',     5,
  '{"effect":"deal_8_em_damage_bounce_to_3_parts"}',
  '{"effect":"disrupt_enemy"}', false),

('act-firestorm',    'Firestorm',        'action', 'rare',     5,
  '{"effect":"apply_burning_3_all_enemies_value_5"}',
  '{"effect":"deal_5_damage"}', false),

('act-overhaul',     'Combat Overhaul',  'action', 'rare',     6,
  '{"effect":"heal_20_draw_3"}',
  '{"effect":"heal_8"}', false),

('act-war-cry',      'War Cry',          'action', 'rare',     4,
  '{"effect":"all_weapons_plus_25_pct_next_turn"}',
  '{"effect":"gain_2_ap"}', false),

('act-lockdown',     'System Lockdown',  'action', 'rare',     5,
  '{"effect":"stun_enemy_2_turns"}',
  '{"effect":"deal_4_damage"}', false),

-- Actions: Epic (4)
('act-annihilate',   'Annihilate',       'action', 'epic',     7,
  '{"effect":"deal_20_damage_any_part"}',
  '{"effect":"deal_8_damage"}', false),

('act-resurrection', 'Emergency Resurrection','action','epic',  8,
  '{"effect":"restore_25_pct_hp_all_parts_remove_all_status"}',
  '{"effect":"heal_20"}', false),

('act-tactical-nuke','Tactical Nuke',    'action', 'epic',     7,
  '{"effect":"deal_15_kinetic_damage_all_enemies"}',
  '{"effect":"deal_10_damage"}', false),

('act-time-warp',    'Time Warp',        'action', 'epic',     8,
  '{"effect":"take_another_turn"}',
  '{"effect":"gain_3_ap"}', false),

-- Actions: Legendary (2)
('act-genesis',      'Genesis Protocol', 'action', 'legendary',10,
  '{"effect":"heal_50_pct_all_parts_draw_5_gain_5_ap"}',
  '{"effect":"heal_25"}', false),

('act-oblivion',     'Oblivion Strike',  'action', 'legendary', 9,
  '{"effect":"deal_30_damage_any_part_ignore_shields_armor"}',
  '{"effect":"deal_15_damage"}', false),

-- ============================================================
-- ENERGY (40 total: 14 common, 12 uncommon, 8 rare, 4 epic, 2 legendary)
-- ============================================================

-- Energy: Common (14)
('eng-capacitor',    'Capacitor Cell',   'energy', 'common',   1,
  '{"ap_gain":1}',
  '{"effect":"kinetic_burst","damage":"1d4"}', true),

('eng-fusion-cell',  'Fusion Cell',      'energy', 'common',   1,
  '{"ap_gain":2}',
  '{"effect":"thermal_burst","damage":"1d6","status":{"type":"burning","duration":1,"value":2}}', true),

('eng-reserve',      'Reserve Cell',     'energy', 'common',   1,
  '{"ap_gain":1}',
  '{"effect":"gain_1_ap"}', true),

('eng-battery-pack', 'Battery Pack',     'energy', 'common',   2,
  '{"ap_gain":2}',
  '{"effect":"gain_1_ap"}', true),

('eng-solar-tap',    'Solar Tap',        'energy', 'common',   1,
  '{"ap_gain":1,"bonus":"draw_1_if_no_status"}',
  '{"effect":"draw_1"}', true),

('eng-kinetic-cell', 'Kinetic Cell',     'energy', 'common',   2,
  '{"ap_gain":2}',
  '{"effect":"kinetic_burst","damage":"1d6"}', true),

('eng-thermal-cell', 'Thermal Cell',     'energy', 'common',   2,
  '{"ap_gain":2}',
  '{"effect":"thermal_burst","damage":"1d6"}', true),

('eng-em-cell',      'EM Cell',          'energy', 'common',   2,
  '{"ap_gain":2}',
  '{"effect":"em_burst","damage":"1d4"}', true),

('eng-chem-cell',    'Chemical Cell',    'energy', 'common',   2,
  '{"ap_gain":2}',
  '{"effect":"chem_burst","damage":"1d4"}', true),

('eng-pulse-pack',   'Pulse Pack',       'energy', 'common',   1,
  '{"ap_gain":1,"bonus":"next_action_costs_1_less"}',
  '{"effect":"gain_1_ap"}', true),

('eng-hot-cell',     'Hot Cell',         'energy', 'common',   2,
  '{"ap_gain":3,"cost":"apply_overheated_1"}',
  '{"effect":"gain_2_ap"}', true),

('eng-cold-cell',    'Cold Cell',        'energy', 'common',   1,
  '{"ap_gain":1,"bonus":"remove_overheated"}',
  '{"effect":"remove_status_overheated"}', true),

('eng-scrap-power',  'Scrap Power',      'energy', 'common',   1,
  '{"ap_gain":1,"bonus":"heal_2_random_part"}',
  '{"effect":"heal_3"}', true),

('eng-volt-pack',    'Volt Pack',        'energy', 'common',   1,
  '{"ap_gain":2,"cost":"deal_1_self_damage"}',
  '{"effect":"gain_1_ap"}', true),

-- Energy: Uncommon (12)
('eng-em-coil',      'EM Coil',          'energy', 'uncommon', 2,
  '{"ap_gain":2}',
  '{"effect":"em_burst","status":{"type":"emped","duration":1}}', false),

('eng-plasma-cell',  'Plasma Cell',      'energy', 'uncommon', 3,
  '{"ap_gain":3}',
  '{"effect":"thermal_burst","damage":"2d6","status":{"type":"burning","duration":2,"value":3}}', false),

('eng-ion-pack',     'Ion Pack',         'energy', 'uncommon', 3,
  '{"ap_gain":3}',
  '{"effect":"em_burst","status":{"type":"emped","duration":2}}', false),

('eng-chem-tank',    'Chemical Tank',    'energy', 'uncommon', 2,
  '{"ap_gain":2}',
  '{"effect":"chem_burst","damage":"1d6","status":{"type":"corroded","duration":2,"value":2}}', false),

('eng-surge-cell',   'Surge Cell',       'energy', 'uncommon', 3,
  '{"ap_gain":4,"cost":"apply_jammed_1"}',
  '{"effect":"gain_2_ap"}', false),

('eng-recycled-energy','Recycled Energy','energy', 'uncommon', 2,
  '{"ap_gain":2,"bonus":"draw_1"}',
  '{"effect":"draw_1"}', false),

('eng-amp-cell',     'Amplifier Cell',   'energy', 'uncommon', 3,
  '{"ap_gain":3,"bonus":"next_weapon_plus_20_pct"}',
  '{"effect":"gain_2_ap"}', false),

('eng-stable-core',  'Stable Core',      'energy', 'uncommon', 3,
  '{"ap_gain":2,"bonus":"remove_negative_status_random"}',
  '{"effect":"remove_status_random"}', false),

('eng-volatile-cell','Volatile Cell',    'energy', 'uncommon', 2,
  '{"ap_gain":3,"cost":"deal_2_self_damage"}',
  '{"effect":"gain_2_ap"}', false),

('eng-twin-cell',    'Twin Cell',        'energy', 'uncommon', 4,
  '{"ap_gain":4}',
  '{"effect":"gain_2_ap"}', false),

('eng-leech-cell',   'Leech Cell',       'energy', 'uncommon', 3,
  '{"ap_gain":2,"bonus":"deal_3_damage_heal_3"}',
  '{"effect":"heal_3"}', false),

('eng-momentum-cell','Momentum Cell',    'energy', 'uncommon', 2,
  '{"ap_gain":2,"bonus":"ap_plus_1_if_attacked_last_turn"}',
  '{"effect":"gain_1_ap"}', false),

-- Energy: Rare (8)
('eng-overcharge',   'Overcharge',       'energy', 'rare',     3,
  '{"ap_gain":3}',
  '{"effect":"energized","bonus_ap":1}', false),

('eng-reactor-spike','Reactor Spike',    'energy', 'rare',     5,
  '{"ap_gain":5,"cost":"apply_overheated_2"}',
  '{"effect":"gain_3_ap"}', false),

('eng-fusion-surge', 'Fusion Surge',     'energy', 'rare',     5,
  '{"ap_gain":4,"bonus":"all_weapons_plus_15_pct"}',
  '{"effect":"gain_3_ap"}', false),

('eng-null-core',    'Null Core',        'energy', 'rare',     4,
  '{"ap_gain":3,"bonus":"immune_to_em_this_turn"}',
  '{"effect":"remove_status_emped"}', false),

('eng-overdrive-cell','Overdrive Cell',  'energy', 'rare',     5,
  '{"ap_gain":5,"cost":"take_3_damage_per_ap_used"}',
  '{"effect":"gain_4_ap"}', false),

('eng-photon-cell',  'Photon Cell',      'energy', 'rare',     4,
  '{"ap_gain":3,"bonus":"draw_2"}',
  '{"effect":"draw_2"}', false),

('eng-arc-cell',     'Arc Cell',         'energy', 'rare',     5,
  '{"ap_gain":4,"bonus":"em_burst_to_random_enemy_part"}',
  '{"effect":"disrupt_enemy"}', false),

('eng-chain-cell',   'Chain Cell',       'energy', 'rare',     4,
  '{"ap_gain":3,"bonus":"gain_1_ap_per_card_played_this_turn"}',
  '{"effect":"gain_2_ap"}', false),

-- Energy: Epic (4)
('eng-singularity',  'Singularity Cell', 'energy', 'epic',     7,
  '{"ap_gain":5,"bonus":"next_weapon_plus_50_pct"}',
  '{"effect":"gain_4_ap"}', false),

('eng-dark-matter',  'Dark Matter Cell', 'energy', 'epic',     7,
  '{"ap_gain":6,"cost":"deal_5_self_damage"}',
  '{"effect":"gain_4_ap"}', false),

('eng-nova-core',    'Nova Core',        'energy', 'epic',     8,
  '{"ap_gain":6,"bonus":"deal_5_thermal_all_enemies"}',
  '{"effect":"gain_5_ap"}', false),

('eng-void-tap',     'Void Tap',         'energy', 'epic',     6,
  '{"ap_gain":5,"bonus":"remove_all_status"}',
  '{"effect":"gain_3_ap"}', false),

-- Energy: Legendary (2)
('eng-infinity-cell','Infinity Cell',    'energy', 'legendary',10,
  '{"ap_gain":8,"bonus":"draw_3"}',
  '{"effect":"gain_6_ap"}', false),

('eng-omega-surge',  'Omega Surge',      'energy', 'legendary', 9,
  '{"ap_gain":6,"bonus":"all_weapons_plus_50_pct_this_turn"}',
  '{"effect":"gain_5_ap"}', false),

-- ============================================================
-- ARMOR (40 total: 14 common, 12 uncommon, 8 rare, 4 epic, 2 legendary)
-- ============================================================

-- Armor: Common (14)
('arm-plating-light','Light Plating',    'armor', 'common',   1,
  '{"armor_points":5,"target_part":"any"}',
  '{"effect":"block_3_damage"}', true),

('arm-plating-heavy','Heavy Plating',    'armor', 'common',   2,
  '{"armor_points":10,"target_part":"any"}',
  '{"effect":"block_6_damage"}', true),

('arm-buckler',      'Buckler Plate',    'armor',  'common',   1,
  '{"armor_points":3,"target_part":"any"}',
  '{"effect":"block_2_damage"}', true),

('arm-head-guard',   'Head Guard',       'armor', 'common',   1,
  '{"armor_points":6,"target_part":"head"}',
  '{"effect":"block_3_damage"}', true),

('arm-torso-brace',  'Torso Brace',      'armor', 'common',   2,
  '{"armor_points":8,"target_part":"torso"}',
  '{"effect":"block_5_damage"}', true),

('arm-arm-brace',    'Arm Brace',        'armor', 'common',   1,
  '{"armor_points":5,"target_part":"left_arm"}',
  '{"effect":"block_3_damage"}', true),

('arm-leg-guard',    'Leg Guard',        'armor', 'common',   1,
  '{"armor_points":5,"target_part":"left_leg"}',
  '{"effect":"block_3_damage"}', true),

('arm-trauma-plate', 'Trauma Plate',     'armor', 'common',   2,
  '{"armor_points":8,"target_part":"torso","bonus":"reduce_status_duration_1"}',
  '{"effect":"block_4_damage"}', true),

('arm-scrap-armor',  'Scrap Armor',      'armor', 'common',   1,
  '{"armor_points":4,"target_part":"any","cost":"discard_1_on_play"}',
  '{"effect":"block_2_damage"}', true),

('arm-kinetic-pads', 'Kinetic Pads',     'armor', 'common',   2,
  '{"armor_points":7,"target_part":"any","resist":"kinetic_minus_20_pct"}',
  '{"effect":"block_4_damage"}', true),

('arm-heat-tiles',   'Heat Tiles',       'armor', 'common',   2,
  '{"armor_points":6,"target_part":"any","resist":"thermal_minus_20_pct"}',
  '{"effect":"block_4_damage"}', true),

('arm-faraday-mesh', 'Faraday Mesh',     'armor', 'common',   2,
  '{"armor_points":6,"target_part":"any","resist":"em_minus_20_pct"}',
  '{"effect":"block_4_damage"}', true),

('arm-chem-coat',    'Chemical Coating', 'armor', 'common',   2,
  '{"armor_points":6,"target_part":"any","resist":"chemical_minus_20_pct"}',
  '{"effect":"block_4_damage"}', true),

('arm-flak-vest',    'Flak Vest',        'armor', 'common',   1,
  '{"armor_points":4,"target_part":"torso"}',
  '{"effect":"block_2_damage"}', true),

-- Armor: Uncommon (12)
('arm-reactive',     'Reactive Armor',   'armor', 'uncommon', 3,
  '{"armor_points":8,"target_part":"any","on_hit":"deal_2_damage_attacker"}',
  '{"effect":"block_8_damage"}', false),

('arm-ablative',     'Ablative Shield',  'armor', 'rare',     4,
  '{"armor_points":15,"target_part":"torso"}',
  '{"effect":"block_10_damage"}', false),

('arm-reactive-torso','Reactive Torso',  'armor', 'uncommon', 3,
  '{"armor_points":12,"target_part":"torso","on_hit":"deal_3_damage_attacker"}',
  '{"effect":"block_8_damage"}', false),

('arm-deflector',    'Deflector Plate',  'armor', 'uncommon', 3,
  '{"armor_points":10,"target_part":"any","bonus":"15_pct_deflect_chance"}',
  '{"effect":"block_6_damage"}', false),

('arm-layered-plate','Layered Plate',    'armor', 'uncommon', 4,
  '{"armor_points":14,"target_part":"any"}',
  '{"effect":"block_8_damage"}', false),

('arm-thermal-coat', 'Thermal Coat',     'armor', 'uncommon', 3,
  '{"armor_points":10,"target_part":"any","resist":"thermal_minus_40_pct"}',
  '{"effect":"block_6_damage"}', false),

('arm-em-cage',      'EM Cage',          'armor', 'uncommon', 3,
  '{"armor_points":10,"target_part":"any","resist":"em_minus_40_pct"}',
  '{"effect":"block_6_damage"}', false),

('arm-chem-barrier', 'Chemical Barrier', 'armor', 'uncommon', 3,
  '{"armor_points":10,"target_part":"any","resist":"chemical_minus_40_pct"}',
  '{"effect":"block_6_damage"}', false),

('arm-kinetic-fortress','Kinetic Fortress','armor','uncommon', 3,
  '{"armor_points":10,"target_part":"any","resist":"kinetic_minus_40_pct"}',
  '{"effect":"block_6_damage"}', false),

('arm-auto-repair-plate','Auto-Repair Plate','armor','uncommon',4,
  '{"armor_points":8,"target_part":"any","on_upkeep":"heal_3"}',
  '{"effect":"block_5_damage"}', false),

('arm-phase-weave',  'Phase Weave',      'armor', 'uncommon', 4,
  '{"armor_points":10,"target_part":"any","bonus":"dodge_plus_10"}',
  '{"effect":"draw_1"}', false),

('arm-sentinel-plate','Sentinel Plate',  'armor', 'uncommon', 3,
  '{"armor_points":12,"target_part":"head","bonus":"immune_to_disrupted"}',
  '{"effect":"block_7_damage"}', false),

-- Armor: Rare (8)
('arm-fortress-plate','Fortress Plate',  'armor', 'rare',     5,
  '{"armor_points":20,"target_part":"any"}',
  '{"effect":"block_12_damage"}', false),

('arm-reactive-hull','Reactive Hull',    'armor', 'rare',     5,
  '{"armor_points":18,"target_part":"torso","on_hit":"deal_5_damage_attacker"}',
  '{"effect":"block_12_damage"}', false),

('arm-aegis-plate',  'Aegis Plate',      'armor', 'rare',     5,
  '{"armor_points":20,"target_part":"any","resist":"all_minus_20_pct"}',
  '{"effect":"block_12_damage"}', false),

('arm-mirror-coat',  'Mirror Coat',      'armor', 'rare',     6,
  '{"armor_points":16,"target_part":"any","on_hit":"reflect_20_pct_damage"}',
  '{"effect":"block_10_damage"}', false),

('arm-nanite-mesh',  'Nanite Mesh',      'armor', 'rare',     4,
  '{"armor_points":12,"target_part":"any","on_upkeep":"heal_5"}',
  '{"effect":"heal_8"}', false),

('arm-void-plate',   'Void Plate',       'armor', 'rare',     5,
  '{"armor_points":18,"target_part":"any","resist":"em_minus_80_pct"}',
  '{"effect":"block_10_damage"}', false),

('arm-pyro-shield',  'Pyro Shield',      'armor', 'rare',     5,
  '{"armor_points":18,"target_part":"any","resist":"thermal_minus_80_pct"}',
  '{"effect":"block_10_damage"}', false),

('arm-corrosion-liner','Corrosion Liner','armor', 'rare',     4,
  '{"armor_points":15,"target_part":"any","resist":"chemical_minus_80_pct"}',
  '{"effect":"block_10_damage"}', false),

-- Armor: Epic (4)
('arm-colossus-plate','Colossus Plate',  'armor', 'epic',     7,
  '{"armor_points":30,"target_part":"any"}',
  '{"effect":"block_15_damage"}', false),

('arm-immortal-hull','Immortal Hull',    'armor', 'epic',     8,
  '{"armor_points":25,"target_part":"torso","on_upkeep":"heal_8","on_hit":"deal_5_damage_attacker"}',
  '{"effect":"block_15_damage"}', false),

('arm-omni-shield',  'Omni Shield',      'armor', 'epic',     7,
  '{"armor_points":25,"target_part":"any","resist":"all_minus_50_pct"}',
  '{"effect":"block_15_damage"}', false),

('arm-eternal-plate','Eternal Plate',    'armor', 'epic',     8,
  '{"armor_points":28,"target_part":"any","on_upkeep":"heal_5","bonus":"immune_to_corroded"}',
  '{"effect":"block_18_damage"}', false),

-- Armor: Legendary (2)
('arm-god-armor',    'God Armor',        'armor', 'legendary',10,
  '{"armor_points":40,"target_part":"any","resist":"all_minus_75_pct","on_hit":"reflect_25_pct_damage"}',
  '{"effect":"block_25_damage"}', false),

('arm-ouroboros-shell','Ouroboros Shell','armor', 'legendary', 9,
  '{"armor_points":35,"target_part":"any","on_upkeep":"heal_10","on_destroy":"return_to_hand"}',
  '{"effect":"block_20_damage"}', false);
