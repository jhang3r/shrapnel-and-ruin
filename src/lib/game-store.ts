import { writable } from 'svelte/store';
import type { GameState } from './types';

export const gameState = writable<GameState | null>(null);
export const myUserId = writable<string | null>(null);
