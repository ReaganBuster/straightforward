import { atom } from 'recoil';

export const userAtom = atom({
  key: 'userAtom',
  default: {
    user: null,
    loading: true,
  },
});
