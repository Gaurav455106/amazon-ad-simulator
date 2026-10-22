import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/console.css'
import './styles/console-widgets.css'
import './styles/builder.css'
import './styles/sd.css'
import './styles/createCampaign.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
