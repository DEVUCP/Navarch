import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import styles from '../styles/ServerWindow.module.css';
import { useState } from "react";

import VersionSelectDropdown from './VersionSelectDropdown';
import StartStopBtn from './StartStopBtn';
import Console from './Console';
import TabButtons from './TabButtons';

function ServerWindow(){

  const [tabOption, setTabOption] = useState("info-tab")

  return(
    <div className={styles.container}>

      <div className={styles.subContainer}>
        <TabButtons taboption={setTabOption}></TabButtons>
        <div className={styles.subContainer}>
          <div className={tabOption !== "info-tab" ? styles.hidden : styles.tabPage}>
            info tab placeholder
          </div>
          <div className={tabOption !== "properties-tab" ? styles.hidden : styles.tabPage}>
            properties tab placeholder
          </div>
          <div className={tabOption !== "version-tab" ? styles.hidden : styles.tabPage}>
            version tab placeholder
          </div>
        </div>
      </div>


      <div className={styles.subContainer}>
        <Console></Console>
        <StartStopBtn></StartStopBtn>
        <VersionSelectDropdown></VersionSelectDropdown>
      </div>
    </div>
  );
}


export default ServerWindow;
