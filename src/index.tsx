import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { AppRoutes } from "./routes/AppRoutes";
import Home from "./pages/Home";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      {/* <Home /> */}
      <AppRoutes />
    </AuthProvider>
  </ThemeProvider>,
);
