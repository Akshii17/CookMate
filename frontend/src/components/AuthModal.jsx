import { useEffect, useState } from "react";
import { X, Eye, EyeClosed } from "lucide-react";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass =
  "w-full rounded-xl border-[1.5px] border-[#c8c2a8] bg-[#e4e0ce] px-3.5 py-2.5 font-sans text-[13.5px] text-[#2c2818] outline-none transition-[border-color,background] placeholder:font-light placeholder:text-[#9a9078] focus:border-[#8a9c68] focus:bg-[#dedad0]";

export function AuthModal({ mode, onClose, onSwitchMode, onSuccess }) {
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLogin && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    const userEmail = email.trim();

    if (!userEmail) {
      toast.error("Please enter your email");
      return;
    }
    if (!emailRegex.test(userEmail)) {
      toast.error("Please enter a valid email address");
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
    if (!isLogin && password.length < 8) {
      toast.error("Password must be at least 8 characters");
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
          {!isLogin && (
            <div>
              <label
                htmlFor="auth-name"
                className="mb-1.5 block font-sans text-[11.5px] font-medium text-[#6a6454]"
              >
                Name
              </label>

              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="mb-1.5 block font-sans text-[11.5px] font-medium text-[#6a6454]">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-1.5 block font-sans text-[11.5px] font-medium text-[#6a6454]">
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={inputClass}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="auth-confirm"
                className="mb-1.5 block font-sans text-[11.5px] font-medium text-[#6a6454]"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="auth-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                </button>
              </div>
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

        <div className="flex justify-center">
          <GoogleLogin
            theme="outline"
            shape="pill"
            size="large"
            text="signin_with"
            width="330"
            onSuccess={(credentialResponse) => {
              const token = credentialResponse.credential;

              console.log(token); //replace this later with await googleLogin(token);
              toast.success("Google login successful!");
            }}
            onError={() => {
              toast.error("Google login failed");
            }}
          />
        </div>

        <p className="mt-6 text-center font-sans text-sm text-[#6e6858]">
          {isLogin ? (
            <>
              Don't have an account?{" "}
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
