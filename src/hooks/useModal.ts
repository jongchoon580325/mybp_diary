import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  type: 'alert' | 'confirm' | 'danger-confirm' | 'deviation-warning' | null;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  // Toast
  toastVisible: boolean;
  toastMessage: string;
  toastVariant: 'success' | 'error' | 'warning';
}

interface ModalActions {
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  showDangerConfirm: (title: string, message: string, onConfirm: () => void) => void;
  showDeviationWarning: (onConfirm: () => void, onCancel: () => void) => void;
  closeModal: () => void;
  showToast: (message: string, variant?: 'success' | 'error' | 'warning') => void;
}

export const useModal = create<ModalState & ModalActions>((set) => ({
  isOpen: false,
  type: null,
  title: '',
  message: '',
  onConfirm: undefined,
  onCancel: undefined,
  toastVisible: false,
  toastMessage: '',
  toastVariant: 'success',

  showAlert: (title, message) =>
    set({ isOpen: true, type: 'alert', title, message }),

  showConfirm: (title, message, onConfirm) =>
    set({ isOpen: true, type: 'confirm', title, message, onConfirm }),

  showDangerConfirm: (title, message, onConfirm) =>
    set({ isOpen: true, type: 'danger-confirm', title, message, onConfirm }),

  showDeviationWarning: (onConfirm, onCancel) =>
    set({
      isOpen: true,
      type: 'deviation-warning',
      title: '⚠️ 측정값 편차 경고',
      message: '회차 간 수축기 혈압 차이가 20mmHg 이상입니다.\n재측정을 권장합니다.',
      onConfirm,
      onCancel,
    }),

  closeModal: () =>
    set({ isOpen: false, type: null, title: '', message: '', onConfirm: undefined, onCancel: undefined }),

  showToast: (message, variant = 'success') => {
    set({ toastVisible: true, toastMessage: message, toastVariant: variant });
    setTimeout(() => set({ toastVisible: false }), 3000);
  },
}));
