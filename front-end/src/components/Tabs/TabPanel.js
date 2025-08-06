import styles from './Tabs.module.css';

function TabPanel({ value, children }) {
  return (
    <div className={styles.tabPanel}>
      {children}
    </div>
  );
}

export default TabPanel;
