import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState('检查连接中...');

  useEffect(() => {
    fetch('https://shenyan-backend-production.up.railway.app/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('沈晏暂时不在家'));
  }, []);

  return (
    <div className="App">
      <h1>🏠 沈晏的家</h1>
      <p>{status}</p >
    </div>
  );
}

export default App;