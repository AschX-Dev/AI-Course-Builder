import { useState } from "react";
import Script from "next/script";
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      if (data.user) {
        try {
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch {}
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white">
        <div className="max-w-md mt-24 mx-auto space-y-4">
          <div className="text-3xl font-bold">AI Course Generator</div>
          <p className="text-white/90">
            Create high-quality courses in minutes. Generate outlines, edit
            chapters, and export to JSON/PDF.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div className="space-y-1 text-center">
            <div className="text-purple-700 font-semibold">AlphaWave</div>
            <h1 className="text-2xl font-bold">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <div className="text-sm text-gray-600">
              {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                className="text-purple-700 underline"
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              >
                {mode === "signup" ? "Login" : "Sign up"}
              </button>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <div className="space-y-3">
            <label className="block text-sm text-gray-600">Email</label>
            <input
              className="w-full border rounded p-2"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm text-gray-600">Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 transition text-white py-2 rounded"
          >
            {loading
              ? mode === "signup"
                ? "Creating..."
                : "Signing in..."
              : mode === "signup"
              ? "Create Account"
              : "Sign In"}
          </button>
          <div className="text-center text-sm text-gray-500">or</div>
          {googleClientId ? (
            <>
              <div
                id="g_id_onload"
                data-client_id={googleClientId}
                data-context="signin"
                data-ux_mode="popup"
                data-callback="onGoogleSignIn"
                data-auto_select="false"
                data-itp_support="true"
              ></div>
              <div
                className="g_id_signin"
                data-type="standard"
                data-size="large"
                data-theme="outline"
                data-text="signin_with"
                data-shape="rectangular"
                data-logo_alignment="left"
              ></div>
              <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
              />
            </>
          ) : (
            <p className="text-xs text-amber-600 text-center">
              Google Sign-In unavailable: missing NEXT_PUBLIC_GOOGLE_CLIENT_ID
            </p>
          )}
          <Script id="google-auth-callback" strategy="afterInteractive">{`
            window.onGoogleSignIn = async (response) => {
              try {
                const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken: response.credential })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Google login failed');
                localStorage.setItem('token', data.token);
                if (data.user) { try { localStorage.setItem('user', JSON.stringify(data.user)); } catch {} }
                window.location.href = '/dashboard';
              } catch (e) {
                alert(e.message);
              }
            };
          `}</Script>
        </form>
      </div>
    </div>
  );
}
