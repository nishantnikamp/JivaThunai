import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Prevent double clicks on all buttons using animation
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (btn && !btn.classList.contains('btn-clicked-anim')) {
    btn.classList.add('btn-clicked-anim');
    // Remove class after animation completes (e.g., 1s)
    setTimeout(() => {
      btn.classList.remove('btn-clicked-anim');
    }, 1000);
  }
}, true);
