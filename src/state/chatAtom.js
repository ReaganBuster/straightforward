import { atom } from 'recoil';

export const activeChatAtom = atom({
  key: 'activeChatAtom',
  default: null, // will store { userId, username, messages }
});

export const unlockedMediaAtom = atom({
  key: 'unlockedMediaAtom',
  default: {}, // example: { [mediaId]: true }
});
