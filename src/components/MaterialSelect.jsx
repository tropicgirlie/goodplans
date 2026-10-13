import { Children, isValidElement, useEffect, useRef, useState } from 'react';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import './MaterialSelect.css';
const textOf = children => Children.toArray(children).map(child => isValidElement(child) ? textOf(child.props.children) : String(child)).join('');

// One adapter for controlled React fields and ordinary FormData forms.
// Material Web supplies keyboard navigation, typeahead, validation and popovers.
export default function MaterialSelect({ children, value, defaultValue, onChange, className = '', compact = false, ...props }) {
  const options = Children.toArray(children);
  const initialValue = String(defaultValue ?? options.find(option => !option.props.disabled)?.props.value ?? '');
  const [localValue, setLocalValue] = useState(initialValue);
  const selectedValue = value === undefined ? localValue : String(value);
  const selectedOption = options.find(option => String(option.props.value ?? '') === selectedValue);
  const displayText = selectedOption ? selectedOption.props['data-display-text'] ?? textOf(selectedOption.props.children) : '';
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const element = useRef(null);
  const callback = useRef(onChange);
  callback.current = onChange;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const field = element.current;
    const change = event => {
      setLocalValue(field.value);
      callback.current?.(event);
    };
    const reset = () => setLocalValue(initialValue);
    field.addEventListener('change', change);
    field.form?.addEventListener('reset', reset);
    return () => {
      field.removeEventListener('change', change);
      field.form?.removeEventListener('reset', reset);
    };
  }, [initialValue]);

  return <md-outlined-select {...props} ref={element} value={selectedValue} displayText={displayText} quick={reducedMotion}
    className={`gp-material-select ${compact ? 'gp-material-compact' : ''} ${className}`}
    menu-positioning="popover">
    {options.map(option => <md-select-option key={option.key ?? option.props.value}
      value={String(option.props.value ?? '')} selected={String(option.props.value ?? '') === selectedValue}
      disabled={option.props.disabled} lang={option.props.lang}
      displayText={option.props['data-display-text'] ?? textOf(option.props.children)} typeaheadText={textOf(option.props.children)}>
      <div slot="headline">{option.props.children}</div>
    </md-select-option>)}
  </md-outlined-select>;
}
