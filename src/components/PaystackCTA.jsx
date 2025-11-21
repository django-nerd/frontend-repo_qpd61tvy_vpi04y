export default function PaystackCTA() {
  return (
    <section id="pay" className="relative py-16 bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-8 md:p-10">
          <div className="md:flex items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-bold">Unlock Pro features</h3>
              <p className="mt-2 text-blue-200/80">Get advanced AI optimization, multi-account publishing, and priority support. Secure payments via Paystack.</p>
            </div>
            <a href="https://paystack.com/buy/ai-wealth-builder-suwzdg" target="_blank" rel="noreferrer" className="mt-6 md:mt-0 inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 font-medium shadow-lg shadow-emerald-500/25 transition">
              Pay with Paystack
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
