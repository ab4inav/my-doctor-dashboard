import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = loginSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account.",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.firstName, data.lastName);
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <UserRound className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-medical-gray-800">MediPractice</h1>
          <p className="text-medical-gray-600 mt-2">Secure Doctor Portal</p>
        </div>

        {!isSignUp ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@medicalpractice.com"
                {...loginForm.register("email")}
                className="mt-2"
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...loginForm.register("password")}
                className="mt-2"
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm text-medical-gray-600">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-medical-blue hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-medical-blue text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        ) : (
          <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...signUpForm.register("firstName")}
                  className="mt-2"
                />
                {signUpForm.formState.errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">
                    {signUpForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...signUpForm.register("lastName")}
                  className="mt-2"
                />
                {signUpForm.formState.errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">
                    {signUpForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...signUpForm.register("email")}
                className="mt-2"
              />
              {signUpForm.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...signUpForm.register("password")}
                className="mt-2"
              />
              {signUpForm.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...signUpForm.register("confirmPassword")}
                className="mt-2"
              />
              {signUpForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {signUpForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-medical-blue text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-medical-gray-600">
            {!isSignUp ? "New to MediPractice?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-medical-blue hover:underline font-medium"
            >
              {!isSignUp ? "Create Account" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
