import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Index } from "./pages/Index/Index";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> */}
          <Route path="/" element={<Index />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
