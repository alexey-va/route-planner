import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initClientTelemetry } from './utils/clientTelemetry.js'

initClientTelemetry()

ReactDOM.createRoot(document.getElementById('root')).render(

    <App />,
)
