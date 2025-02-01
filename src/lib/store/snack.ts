import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SnackPerisistState = {
  snackOpen: boolean;
  snackMessage: string;
  snackSeverity: 'success' | 'info' | 'warning' | 'error';
};

type SnackPerisistAction = {
  setSnackOpen: (snackOpen: boolean) => void;
  getSnackOpen: () => boolean;
  setSnackMessage: (message: string) => void;
  getSnackMessage: () => string;
  setSnackSeverity: (severity: 'success' | 'info' | 'warning' | 'error') => void;
  getSnackSeverity: () => 'success' | 'info' | 'warning' | 'error';

  resetSnack: () => void;
};

const initialSnackState: SnackPerisistState = {
  snackOpen: false,
  snackMessage: '',
  snackSeverity: 'success',
};

export const useSnackPresistStore = create(
  persist<SnackPerisistState & SnackPerisistAction>(
    (set, get) => ({
      ...initialSnackState,

      setSnackOpen: (value) => {
        set(() => ({ snackOpen: value }));
        if (value) {
          setTimeout(() => {
            set(() => ({ snackOpen: !value }));
          }, 3000);
        }
      },
      getSnackOpen: () => get().snackOpen,
      setSnackMessage: (value) => set(() => ({ snackMessage: value })),
      getSnackMessage: () => get().snackMessage,
      setSnackSeverity: (value) => set(() => ({ snackSeverity: value })),
      getSnackSeverity: () => get().snackSeverity,

      resetSnack: () => {
        set(initialSnackState);
      },
    }),
    {
      name: 'cryptopayserver.store.snack',
    },
  ),
);
