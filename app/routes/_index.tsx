import { useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import {
  auth,
  createUserDocument,
  signInWithGoogle,
} from "../utils/firebase.client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "@remix-run/react";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const navigate = useNavigate();
  const fadeStyles = useSpring({
    opacity: authChecking ? 0 : 1,
    transform: authChecking ? "translateY(24px)" : "translateY(0px)",
    config: { tension: 200, friction: 26 },
  });

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in, redirect to dashboard
        navigate("/dashboard");
      } else {
        setAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("Error");
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      // Create or update user document
      await createUserDocument(userCredential.user);

      // Reset form
      setEmail("");
      setPassword("");
      // Redirect to dashboard or home page after successful authentication
      navigate("/dashboard");
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Add Google sign-in handler
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Google sign-in failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setPassword("");
  };

  // Show loading spinner while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    ); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <animated.div
        style={fadeStyles}
        className="w-full max-w-6xl bg-white/90 backdrop-blur rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        <div className="flex-1 px-6 py-10 sm:px-12 bg-white flex items-center">
          <div className="w-full space-y-8">
            {/* Logo or App Name */}
            <div>
              <h1 className="text-4xl font-extrabold text-brand mb-3 drop-shadow-glow">
                MyAppCostEstimator.com
              </h1>
              <p className="text-gray-700 text-lg font-medium max-w-md">
                The modern way to estimate your app costs
              </p>
            </div>

            {/* Auth Card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-8">
              {/* Tab Headers */}
              <div className="flex mb-6">
                <button
                  className={`flex-1 py-2 px-4 text-center rounded-l-md transition-colors ${
                    isLogin
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-center rounded-r-md transition-colors ${
                    !isLogin
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                </button>
              </form>

              {/* Google Sign-In Button */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="gsi-material-button"
                  disabled={loading}
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        style={{ display: "block" }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      Sign in with Google
                    </span>
                    <span style={{ display: "none" }}>Sign in with Google</span>
                  </div>
                </button>
              </div>

              {/* Toggle Link */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    {isLogin ? "Sign up" : "Login"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Image */}
        <div className="flex-1 relative min-h-[320px]">
          <img
            src="/login_page.png"
            alt="Team reviewing app cost estimates"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-indigo-900/30 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
            <p className="text-lg font-semibold">
              Estimate smarter, collaborate faster.
            </p>
            <p className="text-sm text-white/90">
              Your personal budget co-pilot for accurate app planning.
            </p>
          </div>
        </div>
      </animated.div>
    </div>
  );
}
