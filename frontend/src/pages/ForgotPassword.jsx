import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { Alert } from '../components/Feedback.jsx';
import OtpInput from '../components/OtpInput.jsx';
import useCountdown from '../components/useCountdown.js';
import { forgotPassword, verifyResetOtp, resetPassword, resendOtp } from '../api/auth.js';
import { errorMessage } from '../utils/format.js';
import { Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' -> 'verify' -> 'password'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirm: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, restartTimer] = useCountdown(60);

  const handleSendCode = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await forgotPassword(email);
      restartTimer();
      setStep('verify');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit code.');
    setError('');
    setSubmitting(true);
    try {
      await verifyResetOtp(email, otp);
      setInfo('');
      setStep('password');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (passwords.newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (passwords.newPassword !== passwords.confirm) return setError('Passwords do not match.');
    setError('');
    setSubmitting(true);
    try {
      await resetPassword({ email, otp, newPassword: passwords.newPassword });
      navigate('/login', { state: { reset: true } });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await resendOtp(email, 'reset');
      setInfo('A new code has been sent.');
      restartTimer();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (step === 'verify') {
    return (
      <AuthShell
        title="Verify your code"
        subtitle={`If ${email} has an account, a code is on its way.`}
        footer={<Link to="/login">Back to sign in</Link>}
      >
        <form onSubmit={handleVerify} className="form" noValidate>
          <Alert>{error}</Alert>
          {info && <p role="status" style={{ color: '#067647', margin: 0 }}>{info}</p>}
          <OtpInput value={otp} onChange={setOtp} disabled={submitting} />
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Verifying…' : 'Verify code'}
          </button>
          <div style={{ textAlign: 'center' }}>
            {secondsLeft > 0
              ? <span>Resend code in {secondsLeft}s</span>
              : <button type="button" className="btn btn-ghost btn-sm" onClick={handleResend}>Resend code</button>}
          </div>
        </form>
      </AuthShell>
    );
  }

  if (step === 'password') {
    return (
      <AuthShell
        title="Set a new password"
        subtitle={`Code verified. Choose a new password for ${email}.`}
        footer={<Link to="/login">Back to sign in</Link>}
      >
        <form onSubmit={handleReset} className="form" noValidate>
          <Alert>{error}</Alert>
          <label className="field">
            <span>New password</span>
            <div style={{ position: 'relative' }}><input className="input" type={showNew ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} style={{ paddingRight: '2.5rem' }} required /><button type="button" onClick={() => setShowNew(!showNew)} aria-label={showNew ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: '#667085' }}>{showNew ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <div style={{ position: 'relative' }}><input className="input" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat the password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} style={{ paddingRight: '2.5rem' }} required /><button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: '#667085' }}>{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </label>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we will send you a code."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form onSubmit={handleSendCode} className="form" noValidate>
        <Alert>{error}</Alert>
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Sending code…' : 'Send reset code'}
        </button>
      </form>
    </AuthShell>
  );
}
