import { useState } from 'react'

const defaultCampaign = {
  pageName: 'AI Ads Studio',
  headline: 'Unlock 3x ROAS with AI-powered creatives',
  primary_text:
    'Turn ideas into high‑performing ads. Generate variants, test fast, and publish everywhere in minutes.',
  media_url:
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop',
  destination_url: 'https://example.com/landing',
  call_to_action: 'Learn more',
}

function FacebookCard({ data }) {
  return (
    <div className="w-full max-w-[420px] rounded-xl bg-white text-slate-900 shadow-xl ring-1 ring-black/5 overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400" />
        <div>
          <div className="font-semibold leading-tight">{data.pageName}</div>
          <div className="text-xs text-slate-500">Sponsored · 2h</div>
        </div>
      </div>
      {data.primary_text && (
        <div className="px-3 pb-3 text-sm leading-relaxed whitespace-pre-wrap">{data.primary_text}</div>
      )}
      {data.media_url && (
        <div className="aspect-[4/5] w-full bg-slate-200 overflow-hidden">
          <img src={data.media_url} alt="Creative" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-3 border-x border-b border-slate-200">
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-3 py-2 text-xs uppercase tracking-wide text-slate-500 bg-slate-50">
            {new URL(data.destination_url || 'https://example.com').hostname}
          </div>
          <div className="px-3 py-2 font-semibold">{data.headline}</div>
          <div className="px-3 pb-3 text-sm text-slate-600 truncate">{data.destination_url}</div>
          <div className="px-3 pb-3">
            <button className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 transition-colors">
              {data.call_to_action || 'Learn more'}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 text-slate-500 text-sm">
        <div className="flex gap-6">
          <span>👍 1.2k</span>
          <span>💬 214</span>
          <span>↗ 47</span>
        </div>
        <span>…</span>
      </div>
    </div>
  )
}

function WhatsAppPreview({ data }) {
  return (
    <div className="w-full max-w-[420px] rounded-2xl bg-[#0b141a] text-[#e9edef] shadow-xl ring-1 ring-white/5 overflow-hidden">
      <div className="px-4 py-3 bg-[#202c33] text-sm text-[#aebac1]">WhatsApp · Business Preview</div>
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="mt-1 h-7 w-7 rounded-full bg-emerald-400" />
          <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#202c33] p-3 text-sm leading-relaxed">
            <div className="font-semibold text-[#d1f2e0] mb-1">{data.headline}</div>
            <div className="whitespace-pre-wrap text-[#e9edef]/90">{data.primary_text}</div>
            {data.media_url && (
              <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
                <img src={data.media_url} alt="Creative" className="w-full object-cover" />
              </div>
            )}
            {data.destination_url && (
              <a
                href={data.destination_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-emerald-300 hover:bg-emerald-500/20"
              >
                🔗 {data.destination_url}
              </a>
            )}
          </div>
        </div>
        <div className="text-xs text-[#8696a0] text-right">Now</div>
      </div>
    </div>
  )
}

export default function AdPreview() {
  const [data, setData] = useState(defaultCampaign)
  const [show, setShow] = useState({ facebook: true, whatsapp: true })

  const handleChange = (e) => {
    const { name, value } = e.target
    setData((d) => ({ ...d, [name]: value }))
  }

  const copyCaption = async () => {
    const caption = `${data.primary_text}\n\n${data.destination_url || ''}`.trim()
    try {
      await navigator.clipboard.writeText(caption)
      alert('Caption copied to clipboard')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ads preview and posting</h2>
            <p className="mt-1 text-sm text-blue-200/70">See how your creative renders on Facebook and WhatsApp before you publish.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <input
                type="checkbox"
                className="accent-blue-500"
                checked={show.facebook}
                onChange={(e) => setShow((s) => ({ ...s, facebook: e.target.checked }))}
              />
              Facebook
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={show.whatsapp}
                onChange={(e) => setShow((s) => ({ ...s, whatsapp: e.target.checked }))}
              />
              WhatsApp
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium">Composer</h3>
                <button
                  onClick={copyCaption}
                  className="text-xs rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20"
                >
                  Copy caption
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-blue-200/70 mb-1">Headline</label>
                  <input
                    name="headline"
                    value={data.headline}
                    onChange={handleChange}
                    className="w-full rounded-md bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-blue-200/70 mb-1">Primary text</label>
                  <textarea
                    name="primary_text"
                    rows={4}
                    value={data.primary_text}
                    onChange={handleChange}
                    className="w-full rounded-md bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-blue-200/70 mb-1">Media URL</label>
                    <input
                      name="media_url"
                      value={data.media_url}
                      onChange={handleChange}
                      className="w-full rounded-md bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-blue-200/70 mb-1">Destination URL</label>
                    <input
                      name="destination_url"
                      value={data.destination_url}
                      onChange={handleChange}
                      className="w-full rounded-md bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-blue-200/70 mb-1">CTA label</label>
                  <input
                    name="call_to_action"
                    value={data.call_to_action}
                    onChange={handleChange}
                    className="w-full rounded-md bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {show.facebook && (
                <div>
                  <div className="mb-2 text-sm text-blue-200/70">Facebook feed</div>
                  <FacebookCard data={data} />
                </div>
              )}
              {show.whatsapp && (
                <div>
                  <div className="mb-2 text-sm text-blue-200/70">WhatsApp message</div>
                  <WhatsAppPreview data={data} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
