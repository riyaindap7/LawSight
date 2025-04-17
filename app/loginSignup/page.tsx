"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { auth, googleProvider } from "../../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User
} from "firebase/auth";

const UserToggle = dynamic(() => import("@/components/UserToggle"), { ssr: false });

export default function AuthPage() {
  const [userType, setUserType] = useState("police");
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Monitor authentication state & ensure session persistence
  useEffect(() => {
    // Ensure login persistence
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUser(user);
            // Redirect only if user logs in and it's NOT the signup process
            if (!showSignUp) {
              router.push("/");
            }
          } else {
            setUser(null);
          }
        });
        return () => unsubscribe();
      })
      .catch((error) => console.error("Persistence error:", error));
  }, [showSignUp]); // Only re-run when `showSignUp` changes
  
  

  // Handle user login with email & password
  const handleLogin = async () => {
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, userId, password);
      if (userCredential.user) {
        router.push("/");
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // Handle user signup with email & password
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, userId, password);
      setShowSignUp(false);
      setUserId("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Section */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-center items-center p-8 relative">
        <div className="absolute top-4 left-2 flex items-center">
          <img src="/logo.png" alt="LawSight Logo" className="h-8 w-8 mr-2 z-10" />
          <span className="text-xl font-semibold text-white z-10">LawSight</span>
        </div>
        <div className="mt-auto z-10 self-start text-left">
          <h2 className="text-2xl font-semibold mb-1">"Evil is powerless if the good are unafraid."</h2>
          <p className="text-lg">- President Ronald Reagan</p>
        </div>
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/download (1).jpeg')" }}></div>
      </div>

      {/* Right Section - Login/Signup Form */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-12">
        <div className="w-full max-w-sm text-center">
          {showSignUp ? (
            <>
              <div className="mb-4 flex items-center justify-start w-full">
                <button className="flex items-center text-gray-500 hover:text-black" onClick={() => setShowSignUp(false)}>
                  <ArrowLeft className="mr-2" /> Back
                </button>
              </div>
              <h3 className="text-xl font-semibold mb-4">Police Sign Up</h3>
              <Input type="text" placeholder="Police ID" className="mb-3 w-full" value={userId} onChange={(e) => setUserId(e.target.value)} />
              
              <label className="block text-left text-gray-700 font-medium mb-1">Password</label>
              <div className="relative w-full">
                <Input type={showPassword ? "text" : "password"} placeholder="Password" className="mb-4 w-full pr-10"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black" 
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <label className="block text-left text-gray-700 font-medium mb-1">Confirm Password</label>
              <div className="relative w-full">
                <Input type={showPassword ? "text" : "password"} placeholder="Confirm Password" className="mb-4 w-full pr-10"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black" 
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={handleSignUp}>Sign Up</Button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-4">{userType === "police" ? "Police Login" : "Admin Login"}</h3>
              <Input type="text" placeholder={userType === "police" ? "Police ID" : "Admin ID"} className="mb-3 w-full" value={userId} 
                onChange={(e) => setUserId(e.target.value)} />
              
              <label className="block text-left text-gray-700 font-medium mb-1">Password</label>
              <div className="relative w-full">
                <Input type={showPassword ? "text" : "password"} placeholder="Password" className="mb-4 w-full pr-10"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black" 
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={handleLogin}>Login</Button>
              
              <Button className="w-full bg-red-500 text-white hover:bg-red-600 mt-3" onClick={handleGoogleSignIn}>
                Sign in with Google
              </Button>

              <div className="mt-3">
                <button className="text-gray-500 font-medium focus:outline-none hover:text-black" onClick={() => setShowSignUp(true)}>
                  Don't have an account? Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
