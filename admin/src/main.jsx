import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/admin-style.css'
import './assets/styles/charts.css'
import './assets/styles/tables.css'
import './App.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
