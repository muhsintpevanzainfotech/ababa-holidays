import React from 'react';

const FloatingInput = ({ label, value, onChange, type = 'text', error, ...props }) => {
  return (
    <div className="floating-group">
      <input
        type={type}
        className={`floating-input ${error ? 'border-red-500' : ''}`}
        placeholder=" "
        value={value}
        onChange={onChange}
        {...props}
      />
      <label className="floating-label">{label}</label>
      {error && <span className="text-red-500 text-[10px] absolute -bottom-4 left-0">{error}</span>}
    </div>
  );
};

export default FloatingInput;
