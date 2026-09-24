import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const TagInput = ({ tags, onChange, allowCustom = true, placeholder = 'Add tag...' }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
      setInput('');
    }
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="form-control" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', height: 'auto', padding: '8px 12px' }}>
      {tags.map((tag, idx) => (
        <span key={idx} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px' }}>
          {tag}
          <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeTag(idx)} />
        </span>
      ))}
      {allowCustom && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: '60px', color: 'inherit', fontSize: '14px' }}
        />
      )}
    </div>
  );
};

export default TagInput;
