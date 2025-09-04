import Navigation from '@/components/customer/Navigation'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="font-sans">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  )
}
