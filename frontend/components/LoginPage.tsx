import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, redirectToPanel, activityLoading, role } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && redirectToPanel && !activityLoading) {
      router.push('/panel');
    }
  }, [isAuthenticated, redirectToPanel, activityLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(username, password));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="bg-base-100 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Login to Atomation</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-base-content">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full input input-bordered"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-base-content">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full input input-bordered"
              required
            />
          </div>
          {error && <p className="text-error">{error}</p>}
          {isAuthenticated && role && (
            <p className="text-success mt-2">Logged in as {role}</p>
          )}
          <button type="submit" className="w-full btn btn-primary" disabled={loading || activityLoading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : activityLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching data...
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

