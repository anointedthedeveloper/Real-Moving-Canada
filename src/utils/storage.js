/**
 * Browser storage that never throws (private windows and blocked storage return null),
 * used only for per-visitor conveniences such as a saved quote draft.
 */
function make(getStore) {
  return {
    get(key) {
      try {
        const raw = getStore()?.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    set(key, value) {
      try { getStore()?.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    },
    remove(key) {
      try { getStore()?.removeItem(key); } catch { /* storage unavailable */ }
    },
  };
}

export const local = make(() => window.localStorage);
export const session = make(() => window.sessionStorage);

export const STORAGE_KEYS = {
  quoteDraft: 'rmc:quote-draft',
  estimateDraft: 'rmc:estimate-draft',
};
