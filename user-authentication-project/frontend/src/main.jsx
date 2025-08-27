import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext/AuthContext";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* AuthProvider giver authentification context til App.jsx */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
