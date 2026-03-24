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
import { Listing } from "./pages/Listing/Listing";
import { User } from "./pages/User/User";
import { CreateListing } from "./pages/Dashboard/CreateListing/CreateListing";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Meetup } from "./pages/Meetup/Meetup";

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
      <ReactQueryDevtools initialIsOpen={false} />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="listings">
                <Route path=":cardId" element={<Listing />}></Route>
              </Route>
              <Route path="meetups">
                <Route path=":meetupId" element={<Meetup />}></Route>
              </Route>
              <Route path="user">
                <Route path=":user" element={<User />}></Route>
              </Route>
              <Route path="search" element={<Search />} />
              {/* Protected routes */}
              <Route path="/dashboard">
                <Route
                  index
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="create"
                  element={
                    <ProtectedRoute>
                      <CreateListing />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
