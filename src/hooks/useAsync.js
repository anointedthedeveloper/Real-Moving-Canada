import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs an async loader on mount (and when deps change) with loading/error state. */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const run = useRef(0);

  const load = useCallback(() => {
    const id = ++run.current;
    // Refreshes keep the data already on screen; only the first load shows a skeleton.
    setState((s) => ({ ...s, loading: s.data == null, error: null }));
    Promise.resolve()
      .then(loader)
      .then((data) => { if (id === run.current) setState({ data, loading: false, error: null }); })
      .catch((error) => { if (id === run.current) setState({ data: null, loading: false, error }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    return () => { run.current++; };
  }, [load]);

  return { ...state, reload: load };
}
