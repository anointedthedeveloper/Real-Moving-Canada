import TextField from './TextField.jsx';
import SelectField from './SelectField.jsx';
import { INTERNATIONAL, PROVINCE_OPTIONS } from '../../constants/options.js';
import { formatPostal } from '../../utils/format.js';

/**
 * Street address, city, province (or "Outside Canada" + country) and postal code —
 * the location fields from the original quote form. `prefix` is the value path,
 * e.g. "origin" binds origin.address, origin.city, origin.province…
 */
export default function LocationFields({ form, prefix, withAddress = true, autoCompleteSection }) {
  const intl = form.values[prefix]?.province === INTERNATIONAL;
  const ac = (token) => `${autoCompleteSection ? `section-${autoCompleteSection} ` : ''}${token}`;
  const postal = form.field(`${prefix}.postalCode`);

  return (
    <div className="form-grid cols-2">
      {withAddress && (
        <TextField className="span-2" label="Street address" optional {...form.field(`${prefix}.address`)} autoComplete={ac('street-address')} maxLength={160} placeholder="Street and unit number" />
      )}
      <TextField label="City" {...form.field(`${prefix}.city`)} autoComplete={ac('address-level2')} maxLength={80} required />
      <SelectField label="Province or territory" options={PROVINCE_OPTIONS} placeholder="Select…" {...form.field(`${prefix}.province`)} required />
      {intl && <TextField label="Country" {...form.field(`${prefix}.country`)} autoComplete={ac('country-name')} maxLength={60} required />}
      <TextField
        label={intl ? 'Postal / ZIP code' : 'Postal code'} optional {...postal}
        onBlur={(e) => { if (!intl) form.setValue(`${prefix}.postalCode`, formatPostal(e.target.value)); postal.onBlur(); }}
        placeholder={intl ? '' : 'A1A 1A1'} maxLength={12} autoComplete={ac('postal-code')}
      />
    </div>
  );
}
