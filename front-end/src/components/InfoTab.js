import React from 'react';
import { Card, CardContainer, CardItem, CardGrid } from './card';
import styles from '../styles/InfoTab.module.css';
import { useServerData } from '../utils/serverDataContext';
import { useEffect } from 'react';

const statusCodes = {
  STARTING: 2,
  ONLINE: 1,
  OFFLINE: 0
}

const InfoTab = () => {
  const data = useServerData() || {};

  return (
    <div className={styles.container}>
      <CardContainer>
        {/* Server Information */}
        <Card title="Server Information">
          <CardGrid>
            <CardItem 
              label="Status"
              value={
                <span title={
                  data?.status === statusCodes.OFFLINE ? 'Offline' :
                  data?.status === statusCodes.ONLINE ? 'Online' :
                  data?.status === statusCodes.STARTING ? 'Starting' : 
                  'Unknown'
                }>
                  {data?.status === statusCodes.OFFLINE && <span style={{color: 'red'}}>●</span>}
                  {data?.status === statusCodes.ONLINE && <span style={{color: 'green'}}>●</span>}
                  {data?.status === statusCodes.STARTING && <span style={{color: 'yellow'}}>●</span>}
                  {' '}
                  {
                    data?.status === statusCodes.OFFLINE ? 'Offline' :
                    data?.status === statusCodes.ONLINE ? 'Online' :
                    data?.status === statusCodes.STARTING ? 'Starting' :
                    'Unknown'
                  }
                </span>
              }
            />
            <CardItem 
              label="Players Online"
              value={`${data?.playerCount ?? 0}/${data?.max_players ?? "?"}`}
            />
            <CardItem 
              label="Server Version"
              value={data?.version || "Unknown"}
            />
            <CardItem 
              label="Software"
              value={data?.platform || "Unknown"}
            />
            <CardItem 
              label="Uptime"
              value={data?.uptime || "0s"}
            />
          </CardGrid>
        </Card>

        <CardGrid>
          {/* System Resources */}
          <Card title="System Resources">
            <CardGrid>
              <CardItem 
                label="CPU Usage"
                value={
                      data?.memoryUsage?.cpu !== undefined ? 
                        data?.memoryUsage?.cpu.endsWith("%") ? data?.memoryUsage?.cpu : "0%" 
                        : "0%"
                }
              />
              <CardItem 
                label="Memory Usage"
                value={
                  data?.memoryUsage?.usedMB !== undefined ? 
                    !isNaN(data.memoryUsage.usedMB) ? data.memoryUsage.usedMB + 'MB' : '0MB'
                    : "0MB"
                }
              />
            </CardGrid>
          </Card>

          {/* World Info */}
          <Card title="World Information">
            <CardGrid>
              <CardItem 
                label="World Size"
                value={
                  data?.directorySizeMB !== undefined
                    ? `${data.directorySizeMB}MB`
                    : "Unknown"
                }
              />
              <CardItem 
                label="Level Type"
                value={
                  data?.level_type !== null ?
                  data?.level_type.replace("minecraft\\:", "").charAt(0).toUpperCase() + 
                  data?.level_type.replace("minecraft\\:", "").slice(1) :
                  "Unknown"
                  || "Unknown"}
              />
            </CardGrid>
          </Card>
        </CardGrid>
      </CardContainer>
    </div>
  );
};

export default InfoTab;
