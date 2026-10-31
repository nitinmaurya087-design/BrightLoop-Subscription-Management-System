import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, User } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Missing credentials', 'Please enter your work email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const loggedUser = await login({ email, password });
      success('Authentication Successful', `Welcome back, ${loggedUser.fullName || 'Rahul Sharma'}`);
      if (loggedUser.role === 'CUSTOMER') {
        navigate('/portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      error('Sign in failed', err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    const creds = {
      ADMIN: { email: 'admin@brightloop.com', password: 'Admin@12345' },
      STAFF: { email: 'staff@brightloop.com', password: 'Staff@12345' },
      CUSTOMER: { email: 'customer@brightloop.com', password: 'Customer@12345' },
    }[role];
    setEmail(creds.email);
    setPassword(creds.password);
    setIsLoading(true);
    try {
      const loggedUser = await login(creds);
      success('Authentication Successful', `Signed in as ${loggedUser.fullName || 'Administrator'}`);
      if (role === 'CUSTOMER') {
        navigate('/portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      error('Sign in failed', err.response?.data?.message || 'Failed to authenticate.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E8EDF3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-[#4F83CC] text-white shadow-xs mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18" />
            <path d="M3 12h18" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#E8EDF3]">
          BrightLoop
        </h2>
        <p className="mt-1 text-xs text-[#929DAB]">
          Enterprise Subscription & Recurring Billing Management
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#151C26] py-7 px-6 sm:px-8 rounded-lg border border-[#273241]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Work Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul.sharma@sharmatech.in"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#929DAB]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#4F83CC] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-1.5"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Platform
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-[#273241]">
            <p className="text-[11px] font-medium text-[#687586] text-center uppercase tracking-wider mb-2.5">
              Instant Demo Access (Indian Enterprise Profiles)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2 rounded-md border border-[#273241] bg-[#10151D] hover:bg-[#1B2430] hover:border-[#4F83CC]/40 transition-colors text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#4F83CC] mb-1" />
                <span className="text-xs font-medium text-[#E8EDF3]">Rahul Sharma</span>
                <span className="text-[10px] text-[#929DAB]">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('STAFF')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2 rounded-md border border-[#273241] bg-[#10151D] hover:bg-[#1B2430] hover:border-[#8B9EC3]/40 transition-colors text-left"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#8B9EC3] mb-1" />
                <span className="text-xs font-medium text-[#E8EDF3]">Priya Verma</span>
                <span className="text-[10px] text-[#929DAB]">Operations</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('CUSTOMER')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2 rounded-md border border-[#273241] bg-[#10151D] hover:bg-[#1B2430] hover:border-[#3FA77A]/40 transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-[#3FA77A] mb-1" />
                <span className="text-xs font-medium text-[#E8EDF3]">Amit Gupta</span>
                <span className="text-[10px] text-[#929DAB]">Customer</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-[#929DAB]">
            Need a client portal account?{' '}
            <Link to="/register" className="font-medium text-[#4F83CC] hover:underline">
              Register Customer Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
