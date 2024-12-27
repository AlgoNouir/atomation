import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateAccount } from '@/store/slices/accountSlice';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a mock login. In a real application, you would validate credentials against a backend.
    if (email === 'admin@example.com' && password === 'admin') {
      dispatch(updateAccount({
        id: 'user-1',
        name: 'Admin User',
        email: email,
        role: 'admin',
        permittedProjects: ['1'], // This should be fetched from the backend in a real app
      }));
    } else if (email === 'user@example.com' && password === 'admin') {
      dispatch(updateAccount({
        id: 'user-2',
        name: 'Regular User',
        email: email,
        role: 'user',
        permittedProjects: ['1'], // This should be fetched from the backend in a real app
      }));
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="bg-base-100 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Login to Atomation</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-base-content">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit" className="w-full btn btn-primary">
            Log in
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          <p>Use these credentials for testing:</p>
          <p>Admin: admin@example.com / password</p>
          <p>User: user@example.com / password</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

