import React from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { BrowserRouter as Router } from "react-router-dom";

import AppProviders from "./providers/AppProvider.tsx";
import AppRoutes from "./routes/AppRoutes.tsx";

const App: React.FC = () => {
  return (
    <Router>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </Router>
  );
};

export default App;
