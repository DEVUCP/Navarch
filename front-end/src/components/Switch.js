
import React from 'react';
import styles from '../styles/Switch.module.css';

const Switch = ({ checked, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.checked);
  };

  return (
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
      />
      <span className={styles.slider}></span>
    </label>
  );
};

export default Switch;
