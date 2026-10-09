import { useCallback, useRef, useState } from 'react';
import { getPath, setPath, validate } from '../utils/validation.js';

/**
 * Form state with validation, busy/success states and server error mapping.
 *
 *   const form = useForm({ initialValues, schema });
 *   <TextField {...form.field('email')} label="Email" />
 *   <form onSubmit={form.handleSubmit(async (values) => api(values))}>
 *
 * `schema` maps field paths (dot notation for nested values) to validation rules,
 * or is a function (values) => schema for rules that depend on other answers.
 */
export function useForm({ initialValues, schema = {}, onChange } = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [formError, setFormError] = useState('');
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const resolveSchema = (v) => (typeof schema === 'function' ? schema(v) : schema);

  const setValue = useCallback((path, value) => {
    setValues((prev) => {
      const next = setPath(prev, path, value);
      onChange?.(next);
      return next;
    });
    setErrors((prev) => {
      if (!prev[path]) return prev;
      const { [path]: _removed, ...rest } = prev;
      return rest;
    });
  }, [onChange]);

  const validateFields = (paths) => {
    const full = resolveSchema(valuesRef.current);
    const subset = paths ? Object.fromEntries(paths.filter((p) => full[p]).map((p) => [p, full[p]])) : full;
    const found = validate(valuesRef.current, subset);
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(subset).forEach((p) => delete next[p]);
      return { ...next, ...found };
    });
    return found;
  };

  /** Props for a text-like control bound to `path`. */
  const field = (path) => ({
    name: path,
    value: getPath(values, path) ?? '',
    error: errors[path],
    onChange: (e) => setValue(path, e?.target ? e.target.value : e),
    onBlur: () => { if (getPath(valuesRef.current, path)) validateFields([path]); },
  });

  /** Props for a single boolean checkbox bound to `path`. */
  const checkbox = (path) => ({
    name: path,
    checked: !!getPath(values, path),
    error: errors[path],
    onChange: (e) => setValue(path, e.target.checked),
  });

  /** Toggles `option` in the array at `path` (for checkbox groups). */
  const toggle = (path, option) => {
    const list = getPath(valuesRef.current, path) || [];
    setValue(path, list.includes(option) ? list.filter((v) => v !== option) : [...list, option]);
  };

  const focusFirstError = (found) => {
    const first = Object.keys(found)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      const el = document.querySelector(`[name="${CSS.escape(first)}"], [data-field="${CSS.escape(first)}"] input`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleSubmit = (submit, { paths } = {}) => async (e) => {
    e?.preventDefault?.();
    if (status === 'submitting') return;
    setFormError('');
    const found = validateFields(paths);
    if (Object.keys(found).length) {
      setFormError('Please fix the highlighted fields and try again.');
      focusFirstError(found);
      return;
    }
    if (!submit) return;
    setStatus('submitting');
    try {
      await submit(valuesRef.current);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      if (err?.fields && Object.keys(err.fields).length) { setErrors(err.fields); focusFirstError(err.fields); }
      setFormError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  const reset = (next = initialValues) => { setValues(next); setErrors({}); setStatus('idle'); setFormError(''); };

  return {
    values, errors, status, formError,
    submitting: status === 'submitting',
    setValue, setValues, setErrors, setFormError, setStatus,
    field, checkbox, toggle, validateFields, handleSubmit, reset,
  };
}
