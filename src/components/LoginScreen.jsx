import LanguageSwitcher from "../i18n/LanguageSwitcher";
import { ui } from "../i18n/core";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { requestOtp, verifyOtp } from "../lib/goodPlansApi";

export default function LoginScreen({ onBack, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email"); // 'email' | 'code'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      const result = await requestOtp(email.trim());
      if (result.devCode) {
        setDevCode(result.devCode);
      }
      setStep("code");
    } catch (err) {
      setError(
        err.message ||
          "Could not send login code. Make sure the email is on the permitted hosts list.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!code.trim()) return;
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp(email.trim(), code.trim());
      onLoginSuccess(result.user);
    } catch (err) {
      setError(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="gp-app gp-auth">
      <div className="gp-auth-language"><LanguageSwitcher /></div>
      <button className="gp-text-button" onClick={onBack}>
        <ArrowLeft />{ui("Back to planner")}</button>
      <section className="gp-auth-card">
        <p className="gp-eyebrow">{ui("GOOD PLANS · HOST SIGN-IN")}</p>
        <h1>{ui("A good host starts here.")}</h1>
        <p>{ui("Sign in to publish private invitations and collect RSVPs. Your drafts stay saved on this device.")}</p>
        <form
          className="gp-form"
          onSubmit={step === "email" ? handleRequestOtp : handleVerifyOtp}
        >
          {step === "email" ? (
            <label>{ui("Email address")}<input
                autoFocus
                type="email"
                required
                autoComplete="email"
                placeholder={ui("you@example.com")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>
          ) : (
            <>
              <p className="gp-field-note">{ui("Enter the code sent to ")}<b>{ui(email)}</b>.
              </p>
              <label>{ui("Verification code")}<input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  required
                  maxLength={6}
                  placeholder={ui("123456")}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                />
              </label>
            </>
          )}
          {devCode && (
            <p className="gp-feedback">{ui("Local development code: ")}<b>{ui(devCode)}</b>
            </p>
          )}
          {error && (
            <p className="gp-error" role="alert">
              {ui(error)}
            </p>
          )}
          <button
            className="gp-button"
            type="submit"
            disabled={
              loading || (step === "email" ? !email : code.length !== 6)
            }
          >
            {ui(loading
              ? "Please wait…"
              : step === "email"
                ? "Send sign-in code"
                : "Verify and sign in")}
            <Check />
          </button>
          {step === "code" && (
            <button
              className="gp-text-button"
              type="button"
              disabled={loading}
              onClick={() => {
                setStep("email");
                setDevCode("");
                setError("");
              }}
            >{ui("Use another email or request a new code")}</button>
          )}
        </form>
        <p className="gp-field-note">{ui("Publishing is available to approved hosts. You can keep planning without signing in.")}</p>
      </section>
    </main>
  );
}
