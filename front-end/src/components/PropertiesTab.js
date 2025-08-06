import React, { useState } from 'react'
import { Card, CardContainer, CardItem, CardGrid } from './card'
import styles from '../styles/PropertiesTab.module.css'
import { useServerData } from '../utils/serverDataContext'
import Switch from './Switch'
import serverProperties from '../server.properties.json'

const Property = ({ name, description, value, onChange, type, disabled }) => {
  const [localValue, setLocalValue] = useState(value)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  if (type === 'boolean') {
    return (
      <div className={styles.property} style={{ cursor: disabled ? 'wait' : 'default' }}>
        <div className={styles.propertyHeader}>
          <div className={styles.propertyNameContainer}>
            <span className={styles.propertyName}>{name}</span>
          </div>
          <Switch 
            checked={localValue === "true" ? true : localValue === "false" ? false : null}
            onChange={(checked) => handleChange(checked.toString())}
          />
        </div>
            <span className={styles.propertyDescription}>{description}</span>
      </div>
    )
  }

  if (type === 'difficulty') {
    return (
      <div className={styles.property} style={{ cursor: disabled ? 'wait' : 'default' }}>
        <div className={styles.propertyHeader}>
          <div className={styles.propertyNameContainer}>
            <span className={styles.propertyName}>{name}</span>
          </div>
          <select 
            className={styles.select}
            value={localValue || "normal"}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          >
            <option value="peaceful">Peaceful</option>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <span className={styles.propertyDescription}>{description}</span>
      </div>
    )
  }

  if (type === 'gamemode') {
    return (
      <div className={styles.property} style={{ cursor: disabled ? 'wait' : 'default' }}>
        <div className={styles.propertyHeader}>
          <div className={styles.propertyNameContainer}>
            <span className={styles.propertyName}>{name}</span>
          </div>
          <select 
            className={styles.select}
            value={localValue || "survival"}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          >
            <option value="survival">Survival</option>
            <option value="adventure">Adventure</option>
            <option value="creative">Creative</option>
            <option value="spectator">Spectator</option>
          </select>
        </div>
        <span className={styles.propertyDescription}>{description}</span>
      </div>
    )
  }

  if (type === 'number') {
    return (
      <div className={styles.property} style={{ cursor: disabled ? 'wait' : 'default' }}>
        <div className={styles.propertyHeader}>
          <div className={styles.propertyNameContainer}>
            <span className={styles.propertyName}>{name}</span>
          </div>
          <input
            type="number"
            className={styles.numberInput}
            value={localValue || 1}
            min="1"
            onChange={(e) => handleChange(Math.max(1, parseInt(e.target.value)))}
            disabled={disabled}
          />
        </div>
            <span className={styles.propertyDescription}>{description}</span>
      </div>
    )
  }

  if (type === 'text') {
    return (
      <div className={styles.property} style={{ cursor: disabled ? 'wait' : 'default' }}>
        <div className={styles.propertyHeader}>
          <div className={styles.propertyNameContainer}>
            <span className={styles.propertyName}>{name}</span>
          </div>
          <input
            type="text"
            className={styles.textInput}
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        </div>
            <span className={styles.propertyDescription}>{description}</span>
      </div>
    )
  }

  return null
}

const PropertiesTab = () => {
  const data = useServerData() || {}
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [updatedProperties, setUpdatedProperties] = useState({})

  const handlePropertyChange = (property) => async (newValue) => {
    setLoading(true)
    setUpdatedProperties(prev => ({ ...prev, [property]: newValue }))
    try {
      const response = await fetch(`http://${localStorage.getItem('ipAddress')}:${localStorage.getItem('port')}/properties/update/${property}/${newValue}`, { method: 'PUT' })
      if (!response.ok) {
        throw new Error(`Failed to set property ${property} to ${newValue}`)
      }
    } catch (error) {
      console.error(`Error setting property ${property} to ${newValue}: ${error}`)
    }
    finally{
      setLoading(false)
    }
  }

  const importantProperties = [
    'pvp',
    'difficulty',
    'gamemode',
    'hardcore',
    'online-mode',
    'max-players',
    'white-list',
    'announce-player-achievements',
    'force-gamemode',
  ]

  const getPropertyType = (key) => {
    if (key === 'gamemode') return 'gamemode'
    if (key === 'difficulty') return 'difficulty'
    if (key === 'max-players' || key === 'view-distance' || key === 'spawn-protection' || key === 'server-port') return 'number'
    if (key === 'motd' || key === 'level-name' || key === 'level-seed' || key === 'resource-pack' || key === 'resource-pack-sha1') return 'text'
    return 'boolean'
  }

  const isImportantProperty = (key) => importantProperties.includes(key)

  const getPropertyValue = (key) => {
    const snakeKey = key.replace(/-/g, '_')
    if (updatedProperties[key] !== undefined) {
      return updatedProperties[key]
    }
    return data[snakeKey] !== undefined && data[snakeKey] !== null ? data[snakeKey].toString() : ""
  }

  return (
    <div className={styles.container}>
      <CardContainer style={{ padding: '10px' }}>
        <Card style={{ padding: '10px', marginBottom: '10px',}}>
          <CardGrid style={{ gap: '10px' }}>
            {Object.entries(serverProperties['server-properties'])
              .filter(([key]) => isImportantProperty(key))
              .map(([key, value]) => (
                <Property
                  key={key}
                  name={key}
                  description={value.description}
                  value={getPropertyValue(key)}
                  onChange={handlePropertyChange(key)}
                  type={getPropertyType(key)}
                  style={{ fontSize: 'small' }}
                  disabled={loading}
                />
              ))}
          </CardGrid>
        </Card>

        <details className={styles.advancedProperties}>
          <summary>Advanced Properties</summary>
          <Card style={{ padding: '10px', marginTop: '10px' }}>
            <CardGrid style={{ gap: '10px' }}>
              {Object.entries(serverProperties['server-properties'])
                .filter(([key]) => !isImportantProperty(key))
                .map(([key, value]) => (
                  <Property
                    key={key}
                    name={key}
                    description={value.description}
                    value={getPropertyValue(key)}
                    onChange={handlePropertyChange(key)}
                    type={getPropertyType(key)}
                    style={{ fontSize: 'small' }}
                    disabled={loading}
                  />
                ))}
            </CardGrid>
          </Card>
        </details>
      </CardContainer>
    </div>
  )
}

export default PropertiesTab
