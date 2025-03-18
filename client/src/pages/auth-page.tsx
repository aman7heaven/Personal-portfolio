import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import SetupAdmin from "@/components/admin/setup-admin";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [showSetupAdmin, setShowSetupAdmin] = useState(false);
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Registration form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Form validation state
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Check if user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Handle login form submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username: loginUsername, password: loginPassword });
  };
  
  // Handle registration form submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }
    
    setRegisterError(null);
    registerMutation.mutate({ username, email, password });
  };
  
  // Toggle setup admin form
  const toggleSetupAdminForm = () => {
    setShowSetupAdmin(!showSetupAdmin);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left column: Authentication forms */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Welcome to Portfolio</h1>
            <p className="text-center text-slate-600">Please sign in to access the admin dashboard or create an account.</p>
          </div>
          
          {showSetupAdmin ? (
            <div className="bg-white rounded-lg shadow p-6">
              <SetupAdmin onCancel={toggleSetupAdminForm} />
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="loginUsername">Username</Label>
                        <Input 
                          id="loginUsername" 
                          value={loginUsername} 
                          onChange={(e) => setLoginUsername(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loginPassword">Password</Label>
                        <Input 
                          id="loginPassword" 
                          type="password" 
                          value={loginPassword} 
                          onChange={(e) => setLoginPassword(e.target.value)} 
                          required 
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="button" onClick={() => navigate("/")}>Cancel</Button>
                      <Button type="submit" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>Create a new account to get started.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          required 
                        />
                      </div>
                      {registerError && (
                        <p className="text-red-500 text-sm">{registerError}</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="button" onClick={() => navigate("/")}>Cancel</Button>
                      <Button type="submit" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="mt-6 text-center">
            <button 
              className="text-primary hover:text-primary-dark text-sm underline"
              onClick={toggleSetupAdminForm}
            >
              {showSetupAdmin ? "Back to login" : "Setup admin account"}
            </button>
          </div>
        </div>
        
        {/* Right column: Hero */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="bg-gradient-to-br from-primary-700 to-purple-800 text-white rounded-lg shadow-lg p-10">
            <h2 className="text-3xl font-bold mb-4">Portfolio Admin Dashboard</h2>
            <p className="mb-6">
              Manage your portfolio content with ease. Update your experiences, skills, projects, and more with our intuitive admin interface.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Edit your about section and personal information
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Manage your skills and technologies
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Add and update your work experiences
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Showcase your projects with images and descriptions
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Receive messages from your contact form
              </li>
            </ul>
            <p className="text-primary-100 italic">
              "A portfolio is a constant work in progress, reflecting your journey and growth."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
