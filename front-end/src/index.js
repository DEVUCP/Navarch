import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/theme.css';
import App from './App';
import { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

// Read URL parameters and apply them to localStorage
const urlParams = new URLSearchParams(window.location.search);
const ipFromURL = urlParams.get('ip');
const portFromURL = urlParams.get('port');

if (ipFromURL && portFromURL) {
  localStorage.setItem('ipAddress', ipFromURL);
  localStorage.setItem('port', portFromURL);

  // Optional: Clean the URL after applying params
  const cleanURL = new URL(window.location);
  cleanURL.search = '';
  window.history.replaceState({}, document.title, cleanURL.toString());
}

const IpForm = () => {
  const [checkingURL, setCheckingURL] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('');

  async function checkURL(ipAddress, port) {
    try {
      setCheckingURL(true);
      const isIPv4 = ipAddress !== "localhost" ? /^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress) : "localhost";

      const response = await fetch(`http://${isIPv4 ? ipAddress : `[${ipAddress}]`}:${port}/ping`);
      setCheckingURL(false);
      return response.ok;
    } catch (error) {
      console.error(error);
      setCheckingURL(false);
      return false;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await checkURL(ipAddress, port)) {
      if(ipAddress === 'localhost') {
        const publicIp = await fetch('https://ifconfig.me/ip')
        const result = await checkURL(publicIp, port);
        alert(result)
        if(result === 200)
          ipAddress = publicIp;
      }
      localStorage.setItem('ipAddress', ipAddress);
      localStorage.setItem('port', port);
      window.location.reload();
    } else {
      alert("Invalid IP Address or Port, try again");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        margin: 'auto',
        padding: 2,
      }}
    >
      <TextField
        label="IP Address"
        value={ipAddress}
        onChange={(e) => setIpAddress(e.target.value)}
        required
      />
      <TextField
        label="Port"
        value={port}
        onChange={(e) => setPort(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" disabled={checkingURL}>
        Submit
      </Button>
    </Box>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {(!localStorage.getItem('ipAddress') || !localStorage.getItem('port')) ? (
      <IpForm />
    ) : (
      <App />
    )}
  </React.StrictMode>
);
