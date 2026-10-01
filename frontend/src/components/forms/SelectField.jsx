import Field from './Field.jsx';
import Icon from '../common/Icon.jsx';

/** Native <select> (best on mobile) styled to match the design, with a placeholder option. */
export default function SelectField({ label, hint, error, optional, className, options, placeholder = 'Select an option', value, ...select }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      <SelectControl options={options} placeholder={placeholder} value={value} {...select} />
    </Field>
  );
}

function SelectControl({ options, placeholder, value, ...props }) {
  return (
    <span className="select-wrap">
      <select className="input" value={value ?? ''} {...props}>
        {placeholder !== null && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <Icon name="chevron-down" />
    </span>
  );
}
