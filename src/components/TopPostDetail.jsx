import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function TopPostDetail() {
  const { id } = useParams()
  const backend = import.meta.env.VITE_BACKEND_URL || ''
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [share, setShare] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${backend}/api/top-posts/${id}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setItem(data)
        // Fetch share links and analytics if possible
        if (data.campaign_id) {
          try {
            const [sRes, aRes] = await Promise.all([
              fetch(`${backend}/api/campaigns/${data.campaign_id}/share`),
              fetch(`${backend}/api/campaigns/${data.campaign_id}/analytics`)
            ])
            if (sRes.ok) {
              const sData = await sRes.json()
              setShare(sData.share_urls)
            }
            if (aRes.ok) {
              const aData = await aRes.json()
              setAnalytics(aData)
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id, backend])

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-slate-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-blue-200/80">Loading…</p>
        </div>
      </section>
    )
  }

  if (!item) {
    return (
      <section className="py-12 sm:py-16 bg-slate-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-rose-300">Not found.</p>
          <Link to="/" className="text-emerald-400 underline">Go back</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{item.title}</h1>
          <Link to="/" className="text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700">Back</Link>
        </div>

        {item.media_url && (
          <img src={item.media_url} alt={item.title} className="w-full rounded-2xl border border-slate-700/60 mb-4" />
        )}

        <p className="text-blue-200/90 leading-relaxed">{item.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(item.platforms || []).map((p) => (
            <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{p}</span>
          ))}
        </div>

        {item.destination_url && (
          <a href={item.destination_url} target="_blank" rel="noreferrer" className="inline-block mt-5 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700">Visit destination</a>
        )}

        {share && (
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Share</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(share).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noreferrer" className="text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 capitalize">{k}</a>
              ))}
            </div>
          </div>
        )}

        {analytics && (
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Predicted performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Metric label="Reach" value={analytics.predicted_reach} />
              <Metric label="Clicks" value={analytics.predicted_clicks} />
              <Metric label="CTR" value={`${analytics.predicted_ctr}%`} />
              <Metric label="CPL" value={`$${analytics.predicted_cpl}`} />
              <Metric label="Leads (low)" value={analytics.predicted_leads_low} />
              <Metric label="Leads (high)" value={analytics.predicted_leads_high} />
            </div>
            {analytics.suggestions?.length > 0 && (
              <ul className="mt-4 list-disc list-inside text-blue-200/90 space-y-1">
                {analytics.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
      <p className="text-[11px] text-blue-300/80">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
