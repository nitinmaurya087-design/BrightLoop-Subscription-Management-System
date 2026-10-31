import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Lock, Key, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const isLengthValid = newPassword.length > 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isPasswordValid = isLengthValid && hasUppercase && hasLowercase && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      error('Token Missing', 'Please enter your reset token.');
      return;
    }

    if (!isPasswordValid) {
      error('Password Rules', 'Please meet all password security rules.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Mismatch', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const msg = await authApi.resetPassword({ token, newPassword });
      success('Password Updated', msg);
      navigate('/login');
    } catch (err: any) {
      error('Reset Failed', err.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E8EDF3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#E8EDF3]">Set New Password</h2>
        <p className="mt-1 text-xs text-[#929DAB]">
          Enter your verification token and secure new credentials
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#151C26] py-7 px-6 sm:px-8 rounded-lg border border-[#273241]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Reset Token"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste verification token"
              leftIcon={<Key className="w-4 h-4" />}
            />

            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            {/* Password security checklist */}
            <div className="p-3 bg-[#10151D] rounded-md border border-[#273241] space-y-1.5 text-xs">
              <p className="font-medium text-[#929DAB]">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${isLengthValid ? 'text-[#3FA77A]' : 'text-[#687586]'}`}>
                  {isLengthValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>&gt; 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-[#3FA77A]' : 'text-[#687586]'}`}>
                  {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-[#3FA77A]' : 'text-[#687586]'}`}>
                  {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>1 lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-[#3FA77A]' : 'text-[#687586]'}`}>
                  {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>1 special symbol</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
              disabled={!isPasswordValid || newPassword !== confirmPassword}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Update Password & Sign In
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-[#929DAB]">
            <Link to="/login" className="font-medium text-[#4F83CC] hover:underline">
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
