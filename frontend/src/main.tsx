import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import { theme } from "./styles/theme";

/**Renderiza a aplicação React no elemento raiz do DOM.*/
const renderApp = (): void => {
  const container = document.getElementById("root");

  if (!container) {
    throw new Error("Elemento root não encontrado");
  }

  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
};

renderApp();
