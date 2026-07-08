// src/components/MobileDebug.jsx
import React, { useState, useEffect } from 'react';
import { testAPIConnection } from '../api/axios';

const MobileDebug = () => {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [apiUrl, setApiUrl] = useState('');
  const [networkInfo, setNetworkInfo] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setApiUrl(import.meta.env.VITE_API_URL || 'Not set');
    
    // Get network info
    if (navigator.connection) {
      setNetworkInfo({
        type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      });
    }

    // Test API connection
    const test = async () => {
      const result = await testAPIConnection();
      setApiStatus(result.success ? '✅ Connected' : '❌ Failed');
      setLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: result.success ? 'API connection successful!' : `Error: ${result.error}`
      }]);
    };
    test();
  }, []);

  const addLog = (message) => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message
    }]);
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#1a1a2e',
      color: '#fff',
      borderRadius: '10px',
      margin: '10px',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      <h2 style={{ color: '#e94560' }}>📱 Mobile Debug</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <h3>Environment</h3>
        <p>API URL: <span style={{ color: '#00d2ff' }}>{apiUrl}</span></p>
        <p>Mode: <span style={{ color: '#00d2ff' }}>{import.meta.env.MODE || 'unknown'}</span></p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h3>Network</h3>
        <p>Type: <span style={{ color: '#00d2ff' }}>{networkInfo.type || 'Unknown'}</span></p>
        <p>Speed: <span style={{ color: '#00d2ff' }}>{networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Unknown'}</span></p>
        <p>Latency: <span style={{ color: '#00d2ff' }}>{networkInfo.rtt ? `${networkInfo.rtt}ms` : 'Unknown'}</span></p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h3>API Status</h3>
        <p style={{ 
          color: apiStatus === '✅ Connected' ? '#00ff88' : '#ff4444',
          fontSize: '18px'
        }}>
          {apiStatus}
        </p>
        <button 
          onClick={async () => {
            const result = await testAPIConnection();
            setApiStatus(result.success ? '✅ Connected' : '❌ Failed');
            addLog(result.success ? 'API test passed ✅' : `API test failed: ${result.error}`);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e94560',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test API
        </button>
      </div>

      <div>
        <h3>Logs</h3>
        <div style={{
          backgroundColor: '#16213e',
          padding: '10px',
          borderRadius: '5px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              <span style={{ color: '#888' }}>[{log.time}]</span>
              <span style={{ color: '#fff' }}> {log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileDebug;