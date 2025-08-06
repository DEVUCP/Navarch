import styles from './Tabs.module.css';
import { useState } from 'react';
import Tab from './Tab';
import TabPanel from './TabPanel';

function Tabs({ children, labels }) {
  const [activeTab, setActiveTab] = useState(labels[0].value);

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabHeader}>
        {labels.map(tab => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            active={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
          />
        ))}
      </div>
      <div className={styles.tabPanels}>
        {children.map(child =>
          child.props.value === activeTab ? child : null
        )}
      </div>
    </div>
  );
}

export default Tabs;
