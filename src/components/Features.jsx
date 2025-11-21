import { Rocket, Gauge, ShieldCheck, Share2 } from 'lucide-react'

export default function Features() {
  const items = [
    {
      icon: Rocket,
      title: 'AI-optimized creatives',
      desc: 'Smart suggestions for headlines, primary text, and media to maximize CTR and ROAS.'
    },
    {
      icon: Gauge,
      title: 'Unified analytics',
      desc: 'See performance across networks with a single view and standardized metrics.'
    },
    {
      icon: Share2,
      title: 'Publish to 5 pages',
      desc: 'Queue publishing to up to five social pages at once, with per-page status.'
    },
    {
      icon: ShieldCheck,
      title: 'Secure checkout',
      desc: 'Pay securely via Paystack to unlock pro features and higher limits.'
    }
  ]

  return (
    <section className="relative py-16 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-6">
              <it.icon className="w-6 h-6 text-blue-400" />
              <h3 className="mt-4 font-semibold text-lg">{it.title}</h3>
              <p className="mt-2 text-sm text-blue-200/80">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
