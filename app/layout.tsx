import type { Metadata } from 'next'
import Script from "next/script";
import { Sora } from 'next/font/google'
import './globals.css'
import Footer from '../components/Footer'

const sora = Sora({ 
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Balance Solutions',
  description: 'Automação que libera seu time. Conectamos inteligência, automação e pessoas para te entregar tempo.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className={sora.variable} style={{ fontFamily: 'var(--font-sora)' }}>
        <div className="page-shell">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}

