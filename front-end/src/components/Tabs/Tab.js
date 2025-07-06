import styles from './Tabs.module.css';

function Tab({ label, value, active, onClick }) {
  return (
    <button
      className={`${styles.tabButton} ${active ? styles.tabButtonActive : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default Tab;
