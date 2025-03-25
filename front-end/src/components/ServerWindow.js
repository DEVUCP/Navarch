import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import VersionSelectDropdown from './VersionSelectDropdown';
import StartStopBtn from './StartStopBtn';
import Console from './Console';
import styles from '../styles/ServerWindow.module.css';

function ServerWindow(){


  return(
    <div className={styles.container}>

      <div className={styles.subContainer}>
        <Console></Console>
        <StartStopBtn></StartStopBtn>
        <VersionSelectDropdown></VersionSelectDropdown>
      </div>
    </div>
  );
}


export default ServerWindow;
