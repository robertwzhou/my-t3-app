import { atom } from 'jotai';

export const listsAtom = atom<string[]>([]);
export const itemsAtom = atom<Record<string, string[]>>({});