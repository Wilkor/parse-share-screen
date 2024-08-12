import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Client from './page/Client';
import Support from './page/Support';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/client" element={<Client />} />
        <Route path="/support" element={<Support />} />
        <Route path="/" element={<Client />} />
      </Routes>
    </Router>
  );
}

export default App;
