import { AuthProvider } from "./context/AuthContext";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Index } from "./pages/Index/Index";
import { Search } from "./pages/Search/Search";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Login } from "./components/Login/Login";
import { Register } from "./components/Register/Register";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ListingItem } from "./components/Listing/ListingItem/ListingItem";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="listings">
                <Route path=":cardId" element={<ListingItem />}></Route>
              </Route>
              <Route path="search" element={<Search />} />
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute redirect="/login">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
