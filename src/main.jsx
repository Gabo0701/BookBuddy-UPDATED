// BookBuddy React Application Entry Point
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Create React root and render the application
// Wraps the app with Redux Provider for state management
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Redux store provider for global state management */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);