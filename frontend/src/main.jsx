import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
    <Toaster position="top-right" reverseOrder={false} />
  </StrictMode>,
)
