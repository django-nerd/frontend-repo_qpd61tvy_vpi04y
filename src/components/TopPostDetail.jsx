import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function TopPostDetail() {
  const { id } = useParams()
  const backend = import.meta.env.VITE_BACKEND_URL || ''
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [share, setShare] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [copyState, setCopyState] = useState('Copy link')
  const [imgLoaded, setImgLoaded] = useState(false)

  const detailUrl = useMemo(() => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      return `${origin}/top/${id}`
    } catch {
      return ''
    }
  }, [id])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${backend}/api/top-posts/${id}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setItem(data)
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
            // ignore share/analytics failure
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(detailUrl)
      setCopyState('Copied!')
      setTimeout(() => setCopyState('Copy link'), 1500)
    } catch {
      setCopyState('Failed to copy')
      setTimeout(() => setCopyState('Copy link'), 1500)
    }
  }

  if (loading) {
    return (
      <section className="bg-slate-950 text-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="h-7 w-3/4 rounded-lg bg-slate-800 animate-pulse mb-4" />
          <div className="aspect-[16/9] w-full rounded-2xl bg-slate-900 border border-slate-800 animate-pulse mb-5" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      </section>
    )
  }

  if (!item) {
    return (
      <section className="bg-slate-950 text-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-rose-300 mb-4">Not found.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700">← Back</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-slate-950 text-white min-h-screen">
      <HeaderBar title={item.title} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-28 pt-16 sm:pt-20">
        <div className="mb-5 sm:mb-7">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{item.title}</h1>
          {item.subtitle && (
            <p className="mt-1 text-blue-300/80 text-sm sm:text-base">{item.subtitle}</p>
          )}
        </div>

        {item.media_url && (
          <div className="mb-5 sm:mb-7 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className={`relative w-full overflow-hidden ${imgLoaded ? '' : 'animate-pulse'}`}>
              <img
                src={item.media_url}
                alt={item.title}
                onLoad={() => setImgLoaded(true)}
                className="block w-full h-auto object-cover aspect-[16/9]"
              />
            </div>
          </div>
        )}

        {item.summary && (
          <p className="text-blue-100/90 leading-relaxed text-[15px] sm:text-base">{item.summary}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {(item.platforms || []).map((p) => (
            <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{p}</span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={handleCopy} className="text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700">
            {copyState}
          </button>
          {item.destination_url && (
            <a href={item.destination_url} target="_blank" rel="noreferrer" className="text-sm px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700">
              Visit destination
            </a>
          )}
        </div>

        {share && (
          <div className="mt-7">
            <h3 className="font-semibold mb-3">Share</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(share).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noreferrer" className="text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 capitalize">
                  {k}
                </a>
              ))}
            </div>
          </div>
        )}

        {analytics && (
          <div className="mt-8">
            <h3 className="font-semibold mb-3">Predicted performance</h3>
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

      <StickyActions detailUrl={detailUrl} share={share} destination={item.destination_url} />
    </section>
  )
}

function HeaderBar({ title }) {
  return (
    <div className="fixed inset-x-0 top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-950/50 bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700">← Back</Link>
        <p className="truncate text-sm text-blue-200/80 ml-3">{title}</p>
        <span className="w-[84px]" />
      </div>
    </div>
  )
}

function StickyActions({ detailUrl, share, destination }) {
  const shareMenuRef = useRef(null)
  const [open, setOpen] = useState(false)

  const sharePairs = useMemo(() => {
    if (!share) return []
    return Object.entries(share)
  }, [share])

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-slate-950/80 supports-[backdrop-filter]:bg-slate-950/60 backdrop-blur border-t border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-center px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700"
        >
          Share
        </button>
        {destination ? (
          <a
            href={destination}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            Visit
          </a>
        ) : (
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(detailUrl)
              } catch {}
            }}
            className="flex-1 text-center px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            Copy link
          </button>
        )}
      </div>

      {open && sharePairs.length > 0 && (
        <div ref={shareMenuRef} className="max-w-3xl mx-auto px-4 sm:px-6 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sharePairs.map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noreferrer" className="text-center text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 capitalize">
                {k}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-[11px] text-blue-300/80">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
