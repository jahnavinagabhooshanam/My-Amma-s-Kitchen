import React from 'react';

export const FormInput = ({ label, type, name, value, onChange, placeholder, required, disabled }) => {
  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      {label && <label className="form-label" style={{ fontWeight: '600', marginBottom: '6px', color: '#4B483F' }}>{label}</label>}
      <input
        type={type || 'text'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="form-control"
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #EAE6DB', borderRadius: '8px', fontSize: '14px' }}
      />
    </div>
  );
};

export const FormSelect = ({ label, name, value, onChange, options, required, disabled }) => {
  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      {label && <label className="form-label" style={{ fontWeight: '600', marginBottom: '6px', color: '#4B483F' }}>{label}</label>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="form-control"
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #EAE6DB', borderRadius: '8px', fontSize: '14px', backgroundColor: '#FFFFFF' }}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export const FormTextarea = ({ label, name, value, onChange, placeholder, rows, required, disabled }) => {
  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      {label && <label className="form-label" style={{ fontWeight: '600', marginBottom: '6px', color: '#4B483F' }}>{label}</label>}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows || 3}
        required={required}
        disabled={disabled}
        className="form-control"
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #EAE6DB', borderRadius: '8px', fontSize: '14px' }}
      />
    </div>
  );
};

const Forms = () => {
  return (
    <div>
      <FormInput label="Demo Input" placeholder="Enter text..." />
    </div>
  );
};

export default Forms;
