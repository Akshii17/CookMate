import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

function GoogleIcon() {
  return (
    <svg className="size-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const inputClass =
  "w-full rounded-xl border-[1.5px] border-[#c8c2a8] bg-[#e4e0ce] px-3.5 py-2.5 font-sans text-[13.5px] text-[#2c2818] outline-none transition-[border-color,background] placeholder:font-light placeholder:text-[#9a9078] focus:border-[#8a9c68] focus:bg-[#dedad0]";

export function AuthModal({ mode, onClose, onSwitchMode, onSuccess }) {
  const isLogin = mode === "login";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  }, [mode]);

  const handleGoogle = () => {
    toast("Google sign-in coming soon", { icon: "🔜" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = username.trim();
    if (!user) {
      toast.error("Please enter a username");
      return;
    }
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!isLogin && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    onSuccess(isLogin ? "login" : "signup");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#2c2818]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div className="animate-slide-in relative w-full max-w-md rounded-[20px] border-[1.5px] border-cm-card-border bg-cm-card p-6 shadow-[0_24px_64px_rgba(70,62,40,0.2)] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-[#c4be98] bg-[#edead9] text-[#6a6454] transition-colors hover:bg-[#d8d4c0]"
          aria-label="Close"
        >
          <X className="size-4 shrink-0" strokeWidth={1.7} />
        </button>

        <h2 id="auth-modal-title" className="mb-1 font-display text-2xl font-bold text-[#282c18]">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>
        <p className="mb-6 font-sans text-sm font-light text-cm-text-muted">
          {isLogin ? "Log in to continue cooking with CookMate" : "Sign up to start your kitchen journey"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="auth-username" className="mb-1.5 block font-sans text-[11.5px] font-medium text-[#6a6454]">
              Username
            </label>
            <input
              id="auth-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-1.5 block font-sans text-[11.5px] font-medium text-[#6a6454]">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="auth-confirm"
                className="mb-1.5 block font-sans text-[11.5px] font-medium text-[#6a6454]"
              >
                Confirm password
              </label>
              <input
                id="auth-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-full border-[1.5px] border-[#5a7040] bg-cm-olive-dark py-3 font-sans text-sm font-medium text-[#f0ede0] transition-colors hover:bg-[#6a8050]"
          >
            {isLogin ? "Log in" : "Sign up"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#d8d2bc]" />
          <span className="font-sans text-[11px] font-medium tracking-wider text-[#9a9078] uppercase">or</span>
          <div className="h-px flex-1 bg-[#d8d2bc]" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border-[1.5px] border-[#c8c2a8] bg-[#f0ece0] py-2.5 font-sans text-sm text-[#2c2818] transition-colors hover:bg-[#e4e0ce]"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <p className="mt-6 text-center font-sans text-sm text-[#6e6858]">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => onSwitchMode("signup")}
                className="font-medium text-cm-olive-muted underline-offset-2 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onSwitchMode("login")}
                className="font-medium text-cm-olive-muted underline-offset-2 hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
