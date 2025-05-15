import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

type AuthContextType = {
  user: Session["user"] | null;
  login: () => void;
  logout: () => void;
  isLocked: boolean;
  toggleLock: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLocked: false,
  toggleLock: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  // Initialize state from localStorage, default to false if not found
  const [isLocked, setIsLocked] = useState<boolean>(false); // Default to false initially
  
  // Load lock state from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') { // Check if window is defined (client-side)
        const savedLockState = localStorage.getItem('isLocked');
        if (savedLockState !== null) {
          setIsLocked(savedLockState === 'true');
        }
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, []);

  // Save lock state to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') { // Check if window is defined (client-side)
        localStorage.setItem('isLocked', String(isLocked));
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [isLocked]);


  const login = () => signIn("google");
  const logout = () => signOut();
  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  return (
    <AuthContext.Provider value={{ user: session?.user || null, login, logout, isLocked, toggleLock }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
