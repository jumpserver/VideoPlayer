import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { FluentProvider, webLightTheme } from "@fluentui/react-components";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <App />
    </FluentProvider>
  </React.StrictMode>,
);
