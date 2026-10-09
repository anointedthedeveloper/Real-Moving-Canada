import TextField from '../forms/TextField.jsx';
import SelectField from '../forms/SelectField.jsx';
import LocationFields from '../forms/LocationFields.jsx';
import { MOVE_TYPES, PROPERTY_TYPES, PROPERTY_SIZES } from '../../constants/options.js';
import { todayIso } from '../../utils/format.js';

export default function MoveStep({ form }) {
  return (
    <div className="quote-sections">
      <fieldset>
        <legend className="quote-legend">Origin</legend>
        <LocationFields form={form} prefix="origin" autoCompleteSection="from" />
        <div className="form-grid cols-2 mt-1">
          <SelectField label="Origin property type" options={PROPERTY_TYPES} placeholder="Select property type" {...form.field('origin.propertyType')} />
          <SelectField label="Rooms at origin" options={PROPERTY_SIZES} placeholder="Select rooms" {...form.field('origin.rooms')} />
        </div>
      </fieldset>
      <fieldset>
        <legend className="quote-legend">Destination</legend>
        <LocationFields form={form} prefix="destination" autoCompleteSection="to" />
        <div className="form-grid cols-2 mt-1">
          <SelectField label="Destination property type" options={PROPERTY_TYPES} placeholder="Select property type" {...form.field('destination.propertyType')} />
          <SelectField label="Rooms at destination" optional options={PROPERTY_SIZES} placeholder="Select rooms" {...form.field('destination.rooms')} />
        </div>
      </fieldset>
      <fieldset>
        <legend className="quote-legend">Timing</legend>
        <div className="form-grid cols-2">
          <TextField label="Move date" type="date" min={todayIso()} {...form.field('moveDate')} />
          <SelectField label="Move type" options={MOVE_TYPES} placeholder="Select local or long-distance" {...form.field('moveType')} />
        </div>
      </fieldset>
    </div>
  );
}
