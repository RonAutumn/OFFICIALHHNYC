import React from 'react';
import styles from './SelectBox.module.scss';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  data?: any;
}

interface SelectBoxProps<T> {
  options: SelectOption<T>[];
  value: SelectOption<T> | null;
  onChange: (value: SelectOption<T> | null) => void;
  placeholder?: string;
  label?: string;
}

export const SelectBox = <T extends string | number>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label
}: SelectBoxProps<T>) => {
  return (
    <div className={styles.spaceY2}>
      {label && <label className={styles.label}>{label}</label>}
      <select 
        className={styles.select}
        value={value?.value?.toString() || ''}
        onChange={(e) => {
          const selectedOption = options.find(opt => opt.value.toString() === e.target.value);
          onChange(selectedOption || null);
        }}
        style={{ backgroundColor: '#1a1a1a', color: 'white' }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value.toString()} 
            value={option.value.toString()}
            style={{ backgroundColor: '#1a1a1a', color: 'white' }}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
