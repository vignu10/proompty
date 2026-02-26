import LenisProvider from '@/app/components/providers/LenisProvider'
import '@/app/globals.css'

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LenisProvider>{children}</LenisProvider>
}
