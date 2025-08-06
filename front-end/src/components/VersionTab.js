import React, { useState, useEffect } from 'react';
import { Card, CardContainer } from './card';
import { useServerData } from '../utils/serverDataContext';
import styles from '../styles/VersionTab.module.css';

const VersionTab = () => {
  const data = useServerData();
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(data.platform || 'vanilla');
  const [selectedVersion, setSelectedVersion] = useState(data.version || '');
  const [availableVersions, setAvailableVersions] = useState([]);

  const platforms = ['vanilla', 'paper', 'fabric', 'forge'];

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        let versionsUrl;
        switch (selectedPlatform) {
          case 'vanilla':
            versionsUrl = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';
            const vanillaResponse = await fetch(versionsUrl);
            const vanillaData = await vanillaResponse.json();
            const vanillaVersions = vanillaData.versions.map(v => v.id).filter(v => !v.includes('snapshot'));
            setAvailableVersions(vanillaVersions);
            if (!data.version) setSelectedVersion(vanillaVersions[0]);
            break;
          case 'paper':
            versionsUrl = 'https://api.papermc.io/v2/projects/paper';
            const paperResponse = await fetch(versionsUrl);
            const paperData = await paperResponse.json();
            setAvailableVersions(paperData.versions);
            if (!data.version) setSelectedVersion(paperData.versions[0]);
            break;
          case 'fabric':
            versionsUrl = 'https://meta.fabricmc.net/v2/versions/game';
            const fabricResponse = await fetch(versionsUrl);
            const fabricData = await fabricResponse.json();
            const fabricVersions = fabricData.map(v => v.version).filter(v => !v.includes('snapshot'));
            setAvailableVersions(fabricVersions);
            if (!data.version) setSelectedVersion(fabricVersions[0]);
            break;
          case 'forge':
            versionsUrl = 'https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json';
            const forgeResponse = await fetch(versionsUrl);
            const forgeData = await forgeResponse.json();
            const forgeVersions = Object.keys(forgeData);
            setAvailableVersions(forgeVersions);
            if (!data.version) setSelectedVersion(forgeVersions[0]);
            break;
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
        setAvailableVersions([]);
      }
    };

    fetchVersions();
  }, [selectedPlatform, data.version]);

  useEffect(() => {
    if (availableVersions.length > 0 && !availableVersions.includes(selectedVersion)) {
      setSelectedVersion(availableVersions[0]);
    }
  }, [availableVersions, selectedVersion]);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://${localStorage.getItem('ipAddress')}:${localStorage.getItem('port')}/installations/download/${selectedPlatform}/${selectedVersion}`,
        { method: 'PUT' }
      );
      if (!response.ok) {
        throw new Error('Failed to download server');
      }
    } catch (error) {
      console.error('Error downloading server:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <CardContainer style={{ padding: '10px' }}>
        <Card style={{ padding: '20px' }}>
          <div className={styles.versionSelector}>
            <div className={styles.selectorGroup}>
              <label>Platform:</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                disabled={loading}
                className={styles.select}
              >
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.selectorGroup}>
              <label>Version:</label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                disabled={loading || availableVersions.length === 0}
                className={styles.select}
              >
                {availableVersions.map(version => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDownload}
              disabled={loading || availableVersions.length === 0}
              className={styles.downloadButton}
            >
              {loading ? 'Downloading...' : 'Download Server'}
            </button>
          </div>

          <div className={styles.currentVersion}>
            <p>Current Platform: <span>{data.platform || 'Not installed'}</span></p>
            <p>Current Version: <span>{data.version || 'Not installed'}</span></p>
          </div>
        </Card>
      </CardContainer>
    </div>
  );
};

export default VersionTab;