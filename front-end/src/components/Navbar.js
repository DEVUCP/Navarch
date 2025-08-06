import React from 'react';
import styles from '../styles/Navbar.module.css';
import { useServerData } from '../utils/serverDataContext';

function Navbar(){

  const data = useServerData() || {}

  const handleShareClick = () => {
    const ip = localStorage.getItem('ipAddress');
    const port = localStorage.getItem('port');

    if (ip && port) {
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?ip=${ip}&port=${port}`;
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          alert("Share link copied to clipboard!");
        })
        .catch(err => {
          console.error('Failed to copy share link: ', err);
          alert("Failed to copy share link.");
        });
    } else {
      alert("Could not generate share link. IP and/or Port not found in local storage.");
    }
  };

  const handleIpCopyClick = () => {
    const ip = localStorage.getItem('ipAddress');
    const port = data?.server_port;

    if (ip && port) {
      const serverAddress = `${ip}:${port}`;
      navigator.clipboard.writeText(serverAddress)
        .then(() => {
          alert(`Copied "${serverAddress}" to clipboard!`);
        })
        .catch(err => {
          console.error('Failed to copy IP address: ', err);
          alert("Failed to copy IP address.");
        });
    }
  };

  const serverIp = localStorage.getItem('ipAddress');
  const serverPort = data?.server_port;

return(
    <nav className={styles.navbar}>
      <button className={styles.shareButton} onClick={handleShareClick}>
        Share Dashboard
      </button>
      {serverIp && serverPort && (
        <div className={styles.ipDisplay} onClick={handleIpCopyClick} title="Click to copy IP Address">
          <span>Minecraft IP: </span>
          <code>{serverIp}:{serverPort}</code>
        </div>
      )}
    </nav>
);
}

export default Navbar;