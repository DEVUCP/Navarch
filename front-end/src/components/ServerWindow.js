import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import styles from '../styles/ServerWindow.module.css';
import { useState } from "react";

import VersionSelectDropdown from './VersionSelectDropdown';
import StartStopBtn from './StartStopBtn';
import Console from './Console';
import InfoTab from './InfoTab';
import PropertiesTab from './PropertiesTab';

import Tabs from './Tabs/Tabs';
import TabPanel from './Tabs/TabPanel';
import { ServerDataProvider } from '../utils/serverDataContext';

function ServerWindow() {
  return (
    <ServerDataProvider>
      <div className={styles.container}>
        <div className={styles.subContainer}>
          <div className={styles.actionsScreen}>
            <Tabs labels={[
              { value: "info-tab", label: "Info" },
              { value: "properties-tab", label: "Properties" },
              { value: "version-tab", label: "Version" }
            ]}>
              <TabPanel value="info-tab">
                <InfoTab />
              </TabPanel>
              <TabPanel value="properties-tab">
                <PropertiesTab />
              </TabPanel>
              <TabPanel value="version-tab">
                version tab placeholder
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className={styles.subContainer}>
          <Console />
          <StartStopBtn />
          <button 
            className="btn btn-danger" 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Clears all saved data and reloads the page"
          >
            Reset
          </button>
        </div>
      </div>
    </ServerDataProvider>
  );
}

export default ServerWindow;
