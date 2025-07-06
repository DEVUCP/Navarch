import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import styles from '../styles/ServerWindow.module.css';
import { useState } from "react";

import VersionSelectDropdown from './VersionSelectDropdown';
import StartStopBtn from './StartStopBtn';
import Console from './Console';
import InfoTab from './InfoTab';

import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import { ServerDataProvider } from '../utils/serverDataContext';


function ServerWindow(){

  const [tabOption, setTabOption] = useState("info-tab")

  return(
    <div className={styles.container}>
      <div className={styles.subContainer2}>
        <div className={styles.actionsScreen}>
        <Box sx={{ width: '100%'}}>
          <TabContext value={tabOption}>
            <ServerDataProvider>
            <Tabs
              value={tabOption}
              
              onChange={(event, newValue) => setTabOption(newValue)}
              textColor="primary"
              indicatorColor="primary"
              centered
            >
              <Tab value="info-tab" label="Info" />
              <Tab value="properties-tab" label="Properties" />
              <Tab value="version-tab" label="Version" />
            </Tabs>
            <TabPanel value="info-tab">
              <InfoTab></InfoTab>
            </TabPanel>
            <TabPanel value="properties-tab">
              properties tab placeholder
            </TabPanel>
            <TabPanel value="version-tab">
              version tab placeholder
            </TabPanel>
              </ServerDataProvider>
          </TabContext>
        </Box>
      </div>
    </div>


      <div className={styles.subContainer}>
        <Console></Console>
        <StartStopBtn></StartStopBtn>
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
        {/* <VersionSelectDropdown></VersionSelectDropdown> */}
      </div>
    </div>
  );
}


export default ServerWindow;