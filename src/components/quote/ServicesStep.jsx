import Checkbox from '../forms/Checkbox.jsx';
import TextField from '../forms/TextField.jsx';
import TextareaField from '../forms/TextareaField.jsx';
import { QUOTE_SERVICES } from './quoteModel.js';

export default function ServicesStep({ form }) {
  const { values } = form;
  const heavy = values.services.includes('heavy_oversized');
  const storage = values.services.includes('storage');
  return (
    <div className="quote-sections">
      <fieldset>
        <legend className="quote-legend">Services <span className="optional">(select all that apply)</span></legend>
        <div className="check-grid">
          {QUOTE_SERVICES.map((s) => (
            <Checkbox key={s.value} label={s.label} checked={values.services.includes(s.value)} onChange={() => form.toggle('services', s.value)} />
          ))}
        </div>
      </fieldset>
      <div className="form-grid cols-2">
        <TextField
          label="Heavy / oversized items" optional={!heavy} maxLength={500}
          placeholder="List items or write none" {...form.field('heavyItems')}
        />
        <TextField
          label="Storage details" optional={!storage} maxLength={500}
          placeholder="Describe storage needs or write none" {...form.field('storageDetails')}
        />
        <TextareaField
          className="span-2" label="Move notes" optional rows={5} maxLength={3000}
          placeholder="Access details, room notes, items, or other useful information"
          hint="Stairs, elevators, parking, fragile items, timing constraints — and a rough list of large items and boxes."
          {...form.field('notes')}
        />
      </div>
    </div>
  );
}
