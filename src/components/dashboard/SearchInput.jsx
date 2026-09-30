import { useId } from 'react';
import Icon from '../common/Icon.jsx';

export default function SearchInput({ label = 'Search', value, onChange, placeholder }) {
  const id = `q${useId().replace(/:/g, '')}`;
  return (
    <div className="search-input">
      <label htmlFor={id} className="sr-only">{label}</label>
      <Icon name="search" />
      <input id={id} type="search" className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || label} />
    </div>
  );
}
