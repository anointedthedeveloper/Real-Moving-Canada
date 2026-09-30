import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import Button from '../common/Button.jsx';
import SelectField from '../forms/SelectField.jsx';
import { PROVINCES, PROVINCE_OPTIONS, PROPERTY_SIZES } from '../../constants/options.js';

const FROM_OPTIONS = PROVINCES.map((p) => ({ value: p.code, label: p.name }));

/**
 * "Where are you moving?" ticket from the original homepage hero. Sends the route
 * to the instant estimate on /pricing, which prefills its form from the query string.
 */
export default function RouteTicket() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ from: '', to: '', size: '' });
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => { setValues((v) => ({ ...v, [key]: e.target.value })); setErrors((x) => ({ ...x, [key]: undefined })); };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = {};
    if (!values.from) found.from = 'Choose where you’re moving from.';
    if (!values.to) found.to = 'Choose a destination.';
    if (Object.keys(found).length) {
      setErrors(found);
      document.getElementsByName(found.from ? 'from' : 'to')[0]?.focus();
      return;
    }
    const params = new URLSearchParams(Object.entries(values).filter(([, v]) => v));
    navigate(`/pricing?${params}#estimate`);
  };

  return (
    <form className="ticket" onSubmit={onSubmit} noValidate aria-labelledby="ticket-title">
      <div className="ticket-head">
        <h2 id="ticket-title">Where are you moving?</h2>
        <span className="ticket-tag"><Icon name="clock" /> Instant estimate</span>
      </div>
      <div className="ticket-body">
        <div className="ticket-route">
          <span className="ticket-line" aria-hidden="true"><span className="dot dot-from" /><span className="dot dot-to" /></span>
          <div className="ticket-fields">
            <SelectField name="from" label="Moving from" options={FROM_OPTIONS} placeholder="Province or territory" value={values.from} onChange={set('from')} error={errors.from} />
            <SelectField name="to" label="Moving to" options={PROVINCE_OPTIONS} placeholder="Choose a destination" value={values.to} onChange={set('to')} error={errors.to} />
          </div>
        </div>
        <SelectField name="size" label="Home or office size" options={PROPERTY_SIZES} placeholder="Select size" value={values.size} onChange={set('size')} />
        <Button type="submit" variant="dark" block size="lg">See my estimate</Button>
      </div>
    </form>
  );
}
