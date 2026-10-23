import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom n'implémente pas matchMedia, utilisé par Grid.useBreakpoint d'antd.
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom lève une erreur quand antd mesure la barre de défilement d'un pseudo-élément.
const getComputedStyle = globalThis.getComputedStyle.bind(globalThis);
globalThis.getComputedStyle = (element: Element) => getComputedStyle(element);
