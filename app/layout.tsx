import type { Metadata } from 'next'
import { Poppins as PoppinsFont, Inter } from 'next/font/google'
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import './globals.css'

// Font Configurations
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const poppins = PoppinsFont({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
})

// Metadata
export const metadata: Metadata = {
  title: 'evently',
  description: 'evently is a platform for event management',
  icons: {
    icon: '/assets/images/logo.svg'
  }
}

// Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${poppins.variable} antialiased`}>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
