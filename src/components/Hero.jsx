import React, { Suspense, lazy } from 'react'

const SplineCanvas = lazy(() => import('./SplineCanvas'))

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        <Suspense fallback={<div className="w-full h-full bg-slate-900" />}> 
          <div className="w-full h-full">
            <SplineCanvas />
          </div>
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/40 to-slate-900 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-blue-200 ring-1 ring-white/20 backdrop-blur">
            Nexus Ads
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold text-white leading-tight">
            Plan, Launch, and Scale Ads better than the usual platforms
          </h1>
          <p className="mt-4 text-lg md:text-xl text-blue-100/90">
            Create AI-optimized campaigns across Facebook, Instagram, Twitter, LinkedIn, and TikTok. Streamlined publishing to up to 5 pages at once.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              className="inline-flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 font-medium shadow-lg shadow-blue-500/25 transition"
              href="#builder"
            >
              Build a campaign
            </a>
            <a
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white px-6 py-3 font-medium ring-1 ring-white/20 transition"
              href="#pay"
            >
              Unlock Pro with Paystack
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
