import { ApiProvider } from "./context/ApiContext";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <ApiProvider baseUrl="http://localhost:3000">
    <App />
  </ApiProvider>,
)
