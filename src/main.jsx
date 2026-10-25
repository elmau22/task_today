import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. Bootstrap 5 CSS & Bundle JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// 2. Custom CSS Tema Senja Musim Gugur (gelap sinematik, daun merah, kabut + animasi)
import './styles/theme-nature.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);