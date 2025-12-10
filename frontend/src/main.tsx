import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // ✅ AJOUT
import "keen-slider/keen-slider.min.css";
import App from "./App";
import "./index.css";
import "./i18n";
import { HelmetProvider } from "react-helmet-async";

// ✅ Crée une instance de QueryClient
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>   {/* ✅ AJOUT */}
      <HelmetProvider>
      <BrowserRouter>

        <App />
      </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
 