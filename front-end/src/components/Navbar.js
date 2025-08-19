import React, { useRef } from 'react';
import styles from '../styles/Navbar.module.css';
import { useServerData } from '../utils/serverDataContext';

function Navbar() {
  const data = useServerData() || {};
  const fileInputRef = useRef(null);

  const handleShareClick = () => {
    const ip = localStorage.getItem('ipAddress');
    const port = localStorage.getItem('port');

    if (ip && port) {
      let baseUrl = window.location.origin + window.location.pathname;
      const frontendPort = baseUrl.split(':')[2];
      const shareUrl = `http://${ip}:${frontendPort}?ip=${ip}&port=${port}`;
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert("Share link copied to clipboard!"))
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
        .then(() => alert(`Copied "${serverAddress}" to clipboard!`))
        .catch(err => {
          console.error('Failed to copy IP address: ', err);
          alert("Failed to copy IP address.");
        });
    }
  };

  const handlePluginClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file); // this must match multer field name

      const ip = localStorage.getItem('ipAddress');
      const port = localStorage.getItem('port');

      const response = await fetch(`http://${localStorage.ipAddress}:${localStorage.port}/upload-plugin`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
        alert("✅ " + result);
      } else {
        alert("❌ Upload failed: " + response.statusText);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Error uploading file.");
    }
  };

  const serverIp = localStorage.getItem('ipAddress');
  const serverPort = data?.server_port;

  return (
    <nav className={styles.navbar}>
      <button onClick={handlePluginClick}>
        Upload plugin
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
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
