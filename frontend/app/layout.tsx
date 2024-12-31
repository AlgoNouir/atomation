'use client'

import { Provider } from 'react-redux'
import { store } from '../store/store'
import './globals.css'
import { RootState } from '@/store/store'
import LoginPage from '@/components/LoginPage'
import { useAppSelector } from '@/store/hooks'

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


  return <>{children}</>;
};

