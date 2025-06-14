import { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Doctor } from "@shared/schema";
import { getDoctorByUid, createDoctor } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  doctor: Doctor | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const doctorData = await getDoctorByUid(user.uid);
          if (doctorData) {
            setDoctor(doctorData);
          } else {
            // Create a temporary doctor profile for immediate use
            setDoctor({
              id: user.uid,
              uid: user.uid,
              firstName: user.displayName?.split(' ')[0] || 'Doctor',
              lastName: user.displayName?.split(' ')[1] || 'User',
              email: user.email!,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Error fetching doctor data:", error);
          // Set temporary doctor profile when Firestore isn't accessible
          setDoctor({
            id: user.uid,
            uid: user.uid,
            firstName: user.displayName?.split(' ')[0] || 'Doctor',
            lastName: user.displayName?.split(' ')[1] || 'User',
            email: user.email!,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        setDoctor(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create doctor profile
    try {
      const doctorData = await createDoctor({
        uid: user.uid,
        firstName,
        lastName,
        email: user.email!,
      });
      setDoctor(doctorData);
    } catch (error) {
      console.error("Error creating doctor profile:", error);
      // Set a temporary doctor object for immediate use
      setDoctor({
        id: user.uid,
        uid: user.uid,
        firstName,
        lastName,
        email: user.email!,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    doctor,
    loading,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
