import { ApiProvider } from "./context/ApiContext";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./css/alerts/alerts.css";
import App from "./App.tsx";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ApiProvider baseUrl="http://localhost:3000">
      <App />
    </ApiProvider>
  </BrowserRouter>,
)
