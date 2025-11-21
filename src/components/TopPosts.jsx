import { useEffect, useState } from 'react'

export default function TopPosts() {
  const backend = import.meta.env.VITE_BACKEND_URL || ''
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${backend}/api/top-posts`)
        const data = await res.json()
        setItems(data.items || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [backend])

  return (
    <section id="top-posts" className="py-16 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">Top Posts</h2>
          <p className="text-blue-200/80 mt-2">New campaigns appear here as a public post, visible to all connected accounts.</p>
        </div>

        {loading ? (
          <p className="text-blue-200/80">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-blue-200/80">No top posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => (
              <a key={it.id} href={it.destination_url || '#'} target={it.destination_url ? '_blank' : undefined} rel="noreferrer"
                 className="rounded-2xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-900 transition p-4 flex flex-col">
                {it.media_url && (
                  <img src={it.media_url} alt={it.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                )}
                <h4 className="font-semibold text-lg">{it.title}</h4>
                <p className="text-sm text-blue-200/80 line-clamp-3 mt-1">{it.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(it.platforms || []).map((p) => (
                    <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{p}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
