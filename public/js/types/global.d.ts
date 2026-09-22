// Declarações ambiente para globais específicos do Mol que o TypeScript
// não conhece a partir das libs DOM padrão. Mantém o checkJs sem ruído
// para o código que já é correto em runtime.
export {};

declare global {
  interface Window {
    lucide?: { createIcons: (options?: { root?: Document | Element }) => void };
    __molDialogStack?: number;
    __molSelectEvents?: WeakSet<Element>;
    __molLanguageListener?: EventListener;
    __molMobileAppMode?: boolean;
    __molReminderMonitor?: number;
    __molServiceWorkerListener?: EventListener;
    __molServiceWorkerRegistration?: ServiceWorkerRegistration;
  }

  interface Node {
    __molSourceText?: string;
  }

  interface Element {
    __molClose?: () => void;
  }

  interface Navigator {
    standalone?: boolean;
  }
}
