import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAIF STORE | سيف ستور',
  description: 'سيف ستور — تجربة تسوق مصرية راقية للمنتجات والمشروبات والحلويات بطابع أسود وأبيض بسيط.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar-EG" dir="rtl" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col antialiased bg-stone-50 text-neutral-950 selection:bg-neutral-950 selection:text-white">
        {children}
      </body>
    </html>
  )
}
