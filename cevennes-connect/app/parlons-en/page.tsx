import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ParlonsEnPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header theme="orange" />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white py-20">
          <div className="container-custom text-center">
            <div className="floating mb-6">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-5xl">💬</span>
              </div>
            </div>
            <h1 className="font-display font-bold text-5xl lg:text-6xl mb-6">
              Parlons-en
            </h1>
            <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Discussions, débats et échanges sur la vie locale
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container-custom text-center">
            <p className="text-gray-600 text-lg">
              Cette page est en cours de développement. Revenez bientôt !
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
