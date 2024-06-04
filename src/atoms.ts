// src/atoms.ts
import { atom } from 'jotai';

export const listsAtom = atom<string[]>([]);
export const itemsAtom = atom<{ [key: string]: string[] }>({});