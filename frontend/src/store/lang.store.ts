import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'EN' | 'DE';

interface LangState {
    lang: Language;
    toggleLang: () => void;
    t: (en: string, de: string) => string;
}

export const useLangStore = create<LangState>()(
    persist(
        (set, get) => ({
            lang: 'DE', // default to German per requirement
            toggleLang: () => set((state) => ({ lang: state.lang === 'EN' ? 'DE' : 'EN' })),
            t: (en, de) => get().lang === 'EN' ? en : de,
        }),
        {
            name: 'order-german-lang',
        }
    )
);
