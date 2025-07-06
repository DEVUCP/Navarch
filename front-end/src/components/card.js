
import React from 'react';
import styles from '../styles/Card.module.css';

export const Card = ({ title, children }) => {
  return (
    <div className={styles.card}>
      {title && <h2 className={styles.cardTitle}>{title}</h2>}
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );
};

export const CardContainer = ({ children }) => {
  return (
    <div className={styles.cardContainer}>
      {children}
    </div>
  );
};

export const CardItem = ({ label, value }) => {
  return (
    <div className={styles.cardItem}>
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValue + " " + styles.truncatedText}
            title={value}>{value}</span>
    </div>
  );
};

export const CardGrid = ({ children }) => {
  return (
    <div className={styles.cardGrid}>
      {children}
    </div>
  );
};
