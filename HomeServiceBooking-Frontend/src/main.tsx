import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContextProvider.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { UserNotificationProvider } from "./context/UserNotificationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppContextProvider>
      <NotificationProvider>
        <UserNotificationProvider>
          <App />
        </UserNotificationProvider>
      </NotificationProvider>
    </AppContextProvider>
  </BrowserRouter>
);
