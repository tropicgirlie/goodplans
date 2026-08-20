import { useState } from 'react';
import { ArrowLeft, Check, KeyRound, Mail, Sparkles } from 'lucide-react';
import { requestOtp, verifyOtp } from '../lib/goodPlansApi';

export default function LoginScreen({ onBack, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const result = await requestOtp(email.trim());
      if (result.devCode) {
        setDevCode(result.devCode);
      }
      setStep('code');
    } catch (err) {
      setError(err.message || 'Could not send login code. Make sure the email is on the permitted hosts list.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const result = await verifyOtp(email.trim(), code.trim());
      onLoginSuccess(result.user);
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="invite-page flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md mx-auto">
        <button className="back-link mb-6" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Back to planner
        </button>

        <section className="invite-sheet text-left">
          <div className="invite-head mb-6">
            <div className="tiny-mark">Host Organiser Space</div>
            <div className="invite-ribbon bg-[var(--pink)]">sign in</div>
          </div>

          <div className="invite-title-wrap text-center mb-8">
            <p className="eyebrow">organizer portal</p>
            <h1 className="text-4xl text-[var(--hot)] font-display">Welcome Back</h1>
            <p className="text-xs text-[var(--ink)] mt-2">
              Sign in to sync your profile, friends list, activities, and manage your event templates.
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="planner-card bg-[var(--paper)] p-0 shadow-none border-0 gap-4">
              <label className="flex flex-col gap-2">
                <span>Email address</span>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 border-1.5 border-[var(--ink)]"
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                </div>
              </label>

              {error && <p className="invite-error text-[var(--hot)] text-xs font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={loading || !email}
                className="primary w-full justify-center py-3 bg-[var(--hot)] text-white disabled:opacity-50"
              >
                {loading ? 'Sending code...' : 'Send Login Code'} <Sparkles className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="planner-card bg-[var(--paper)] p-0 shadow-none border-0 gap-4">
              <label className="flex flex-col gap-2">
                <span>Enter 6-digit verification code</span>
                <p className="text-[11px] text-[#625b47] font-normal leading-normal">
                  We have sent a login code to <b>{email}</b>. Enter it below to sign in.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 border-1.5 border-[var(--ink)] text-center tracking-widest font-mono text-lg font-bold"
                  />
                  <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                </div>
              </label>

              {devCode && (
                <div className="p-3 rounded bg-[#ded7f1] border-1.5 border-[var(--ink)] text-xs text-[#23221b] font-medium mt-1">
                  <span className="block font-bold text-[var(--olive)] text-[10px] uppercase font-mono tracking-wider mb-1">
                    Demo Mode Notice
                  </span>
                  Your local OTP verification code is: <b className="font-mono text-sm tracking-wider text-[var(--hot)]">{devCode}</b>
                </div>
              )}

              {error && <p className="invite-error text-[var(--hot)] text-xs font-semibold">{error}</p>}

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setDevCode('');
                    setError('');
                  }}
                  disabled={loading}
                  className="rsvp quiet w-1/3 py-2 text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="rsvp w-2/3 justify-center py-2 text-xs text-white"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'} <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="invite-foot text-center mt-8 pt-4 border-t border-[var(--line)]">
            secured by good plans authentication system
          </div>
        </section>
      </div>
    </main>
  );
}
