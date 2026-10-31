import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const msg = await authApi.forgotPassword(email);
      success('Reset Token Dispatched', msg);
      setIsSubmitted(true);
    } catch (err: any) {
      error('Request Failed', err.response?.data?.message || 'Unable to process password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E8EDF3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#E8EDF3]">Reset Password</h2>
        <p className="mt-1 text-xs text-[#929DAB]">
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#151C26] py-7 px-6 sm:px-8 rounded-lg border border-[#273241]">
          {isSubmitted ? (
            <div className="text-center py-2 space-y-3">
              <div className="w-10 h-10 bg-[#3FA77A]/15 text-[#3FA77A] rounded-md flex items-center justify-center mx-auto border border-[#3FA77A]/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#E8EDF3]">Check Your Email</h3>
              <p className="text-xs text-[#929DAB] leading-relaxed">
                If an account exists for <span className="text-[#E8EDF3] font-medium">{email}</span>, a time-limited reset token has been dispatched.
              </p>
              <div className="pt-2">
                <Link to={`/reset-password?email=${encodeURIComponent(email)}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Enter Reset Token
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Registered Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul.sharma@sharmatech.in"
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Password Reset Link
              </Button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4F83CC] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
