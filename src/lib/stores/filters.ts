import { writable, type Writable } from 'svelte/store';

export interface ServerFilters {
    name: string;
    gamemode: string;
    language: string;
    showEmpty: boolean;
    hideRoleplay: boolean;
    requireSampcac: boolean;
    order: 'none' | 'players' | 'ratio';
}

export const DEFAULT_FILTERS: ServerFilters = {
    name: '',
    gamemode: '',
    language: '',
    showEmpty: false,
    hideRoleplay: false,
    requireSampcac: false,
    order: 'none'
};

export const filters: Writable<ServerFilters> = writable({ ...DEFAULT_FILTERS });
