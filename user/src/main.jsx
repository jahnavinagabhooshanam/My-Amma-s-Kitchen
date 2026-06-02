import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/app.min.css'
import './assets/styles/fontawesome.min.css'
import './assets/styles/style.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
