import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientProfile from "@/pages/PatientProfile";
import NotFound from "@/pages/not-found";
import { UserRound, BarChart3, Users, Calendar, FileText, DollarSign, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import logoSvg from "@/assets/logo.svg";

function Navigation() {
  const { doctor, logout } = useAuth();
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", icon: BarChart3, label: "Dashboard" },
    { path: "/patients", icon: Users, label: "Patients" },
    { path: "/prescriptions", icon: FileText, label: "Prescriptions" },
    { path: "/invoices", icon: DollarSign, label: "Invoices" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-medical-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logoSvg} alt="MediPractice Logo" className="h-10" />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-2 text-medical-gray-500 hover:text-medical-gray-700">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-medical-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {doctor ? `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}` : "DR"}
                  </span>
                </div>
                <span className="text-sm font-medium text-medical-gray-700">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm text-medical-gray-500 hover:text-medical-gray-700"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen bg-medical-gray-50">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-sm border-r border-medical-gray-200">
          <div className="p-6">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = location === item.path || 
                  (item.path === "/" && location === "/") ||
                  (item.path === "/patients" && location.startsWith("/patients"));
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start px-4 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-medical-blue text-white hover:bg-blue-700"
                        : "text-medical-gray-700 hover:bg-medical-gray-100"
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <Router />
        </main>
      </div>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/patients" component={Patients} />
      <Route path="/patients/:id" component={PatientProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <UserRound className="text-white text-2xl" />
          </div>
          <p className="text-medical-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Navigation />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AuthenticatedApp />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
