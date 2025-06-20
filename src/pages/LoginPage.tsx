import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ToothLogo } from '../components/common/ToothLogo';

const LoginPage = () => {
  const { login, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      // If login fails, error will be set in the context and handled below
    } catch (err) {
      setLoginError(error || 'Failed to log in');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-primary-500 via-purple-500 to-accent-500">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center space-x-2">
          <ToothLogo className="h-8 w-8" />
          <span className="text-2xl font-extrabold text-neutral-900">DentalCare</span>
        </div>
        {/* <div>
          <span className="text-neutral-700 mr-2">Don't have an account?</span>
          <a
            href="#"
            className="inline-block px-6 py-2 rounded-xl bg-primary-500 text-white font-bold shadow-lg hover:bg-primary-600 transition"
          >
            Sign up
          </a>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl bg-white shadow-2xl px-10 py-12">
            <h1 className="text-4xl font-extrabold text-neutral-900 text-center mb-8">DentalCare</h1>
            {(loginError || error) && (
              <div className="mb-4 rounded-md bg-error-50 p-3 text-sm text-error-800 text-center">
                {loginError || error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Work Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input block w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900 placeholder-neutral-400 transition text-base"
                  placeholder="Enter your work email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input block w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900 placeholder-neutral-400 transition text-base"
                  placeholder="Enter password"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-500">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-gradient w-full py-3 rounded-xl text-lg font-bold shadow-lg transition-all duration-200"
              >
                {isLoading ? 'Signing in...' : 'Log In'}
              </button>
            </form>
          
            <div className="mt-8 text-center text-xs text-neutral-400">
              Demo accounts:<br />
              <span className="font-medium text-neutral-700">Admin:</span> admin@example.com &nbsp;|&nbsp;
              <span className="font-medium text-neutral-700">Dentist:</span> dentist@example.com &nbsp;|&nbsp;
              <span className="font-medium text-neutral-700">Receptionist:</span> receptionist@example.com <br />
              Password: <span className="font-mono">password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;