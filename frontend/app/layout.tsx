'use client'

import { Provider } from 'react-redux'
import { store } from '../store/store'
import './globals.css'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import LoginPage from '@/components/LoginPage'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='overflow-hidden'>
        <Provider store={store}>
          <AuthWrapper>{children}</AuthWrapper>
        </Provider>
      </body>
    </html>
  )
}

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();


  if (!isAuthenticated || !token) {
    return <LoginPage />
  }


  return <>{children}</>;
};

