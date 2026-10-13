import { LAUNCH_LOCATION } from '../../shared/launch';

export default function LocationPicker() {
  return <div className="gp-location-picker">
    <p className="gp-field-note">Local ideas for <strong>{LAUNCH_LOCATION.city}</strong>. No location access needed.</p>
  </div>;
}
