'use client'

import { Provider } from 'react-redux'
import { store } from '../store/store'
import './globals.css'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import LoginPage from '@/components/LoginPage'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <AuthWrapper>{children}</AuthWrapper>
        </Provider>
      </body>
    </html>
  )
}

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const account = useSelector((state: RootState) => state.account);

  if (!account.id) {
    return <LoginPage />;
  }

  return <>{children}</>;
};

