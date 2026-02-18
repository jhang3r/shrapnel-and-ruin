export type Phase = 'upkeep' | 'build' | 'combat' | 'end';
export type StatusEffect = 'burning' | 'empd' | 'stunned' | 'overheated' | 'jammed' | 'corroded' | 'disrupted' | 'marked' | 'shielded' | 'energized' | 'repairing';
export type PartName = 'head' | 'torso' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg';

export interface PartState {
  name: PartName;
  hp: number;
  max_hp: number;
  armor: number;
  installed_components: ComponentState[];
  status_effects: { effect: StatusEffect; turns_remaining: number }[];
}

export interface ComponentState {
  card_id: string;
  hp: number;
  max_hp: number;
  is_active: boolean;
}

export interface ShieldState {
  sp: number;
  max_sp: number;
  regen: number;
  resist_profile: Record<string, number>;
}

export interface PlayerState {
  user_id: string;
  frame_card_id: string;
  parts: Record<PartName, PartState>;
  shield: ShieldState | null;
  ap: number;
  ap_per_turn: number;
  hand: string[];      // card_ids
  deck: string[];      // card_ids (shuffled)
  discard: string[];
  reshuffle_count: number;
  status_effects: { effect: StatusEffect; turns_remaining: number }[];
  is_eliminated: boolean;
  targeting_system: boolean;
}

export interface GameState {
  players: Record<string, PlayerState>;  // keyed by user_id
  turn_order: string[];                  // user_id[]
  phase: Phase;
  turn_number: number;
  active_player_id: string;
  log: string[];
}
