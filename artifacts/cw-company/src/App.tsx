import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Bookings from "@/pages/Bookings";
import BookingDetail from "@/pages/BookingDetail";
import Schedule from "@/pages/Schedule";
import Packages from "@/pages/Packages";
import PackageDetail from "@/pages/PackageDetail";
import WashTypes from "@/pages/WashTypes";
import WashTypeDetail from "@/pages/WashTypeDetail";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Earnings from "@/pages/Earnings";
import Profile from "@/pages/Profile";
import CompanyData from "@/pages/CompanyData";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 },
  },
});

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    const publicRoutes = ["/login", "/register"];
    if (!loading && !user && !publicRoutes.includes(location)) {
      navigate("/login", { replace: true });
    }
    if (!loading && user && user.role !== "company" && user.role !== "admin") {
      // Only company / admin users can use this app
      navigate("/login", { replace: true });
    }
    if (
      !loading &&
      user &&
      (user.role === "company" || user.role === "admin") &&
      publicRoutes.includes(location)
    ) {
      navigate("/", { replace: true });
    }
  }, [loading, user, location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      {!user ? null : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/bookings/:id">{(params) => <BookingDetail id={params.id} />}</Route>
          <Route path="/schedule" component={Schedule} />
          <Route path="/packages" component={Packages} />
          <Route path="/packages/:id">{(params) => <PackageDetail id={params.id} />}</Route>
          <Route path="/wash-types" component={WashTypes} />
          <Route path="/wash-types/:id">{(params) => <WashTypeDetail id={params.id} />}</Route>
          <Route path="/services" component={Services} />
          <Route path="/services/:id">{(params) => <ServiceDetail id={params.id} />}</Route>
          <Route path="/earnings" component={Earnings} />
          <Route path="/profile" component={Profile} />
          <Route path="/company-data" component={CompanyData} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ProtectedRoutes />
          </WouterRouter>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
