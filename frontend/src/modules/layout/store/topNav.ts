import { defineStore } from 'pinia';

const STORAGE_KEY = 'topNav:v1';

export const useTopNavStore = defineStore('topNav', {
  state: () => ({
    selected: 'signals' as 'signals' | 'chat' | 'devtel',
    lastVisited: {
      signals: '' as string,
      chat: '' as string,
      devtel: '' as string,
    } as Record<string, string>,
  }),
  actions: {
    init() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.selected) this.selected = parsed.selected;
          if (parsed.lastVisited) this.lastVisited = parsed.lastVisited;
        }
      } catch (e) {
        // ignore
      }
    },

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ selected: this.selected, lastVisited: this.lastVisited }));
      } catch (e) {
        // ignore
      }
    },

    set(selected: 'signals' | 'chat' | 'devtel') {
      this.selected = selected;
      this.persist();
    },

    setLastVisited(top: 'signals' | 'chat' | 'devtel', path: string) {
      this.lastVisited[top] = path;
      this.persist();
    },
  },
});
