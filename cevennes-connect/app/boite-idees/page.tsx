import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-20">
        <div className="container-custom text-center">
          <p className="text-gray-600 text-lg">Page en cours de développement</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
