
import './globals.css'
import { Metadata } from 'next'
import ProviderComponent from '../components/reduxHandler'


export const metadata: Metadata = {
  title: 'Atimation-Manager'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='overflow-hidden'>
        <ProviderComponent>
          {children}
        </ProviderComponent>
      </body>
    </html>
  )
}
