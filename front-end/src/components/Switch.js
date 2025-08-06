import React from 'react';
import styles from '../styles/Switch.module.css';

const Switch = ({ checked, onChange }) => {
  const handleChange = (e) => {
    // Only allow changes if not in null state
    if (checked !== null) {
      onChange(e.target.checked);
    }
  };

  const isDisabled = checked === null;
  const isChecked = checked === true;

  return (
    <label className={`${styles.switch} ${isDisabled ? styles.disabled : ''}`}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        disabled={isDisabled}
      />
      <span className={styles.slider}></span>
    </label>
  );
};

export default Switch;
