import { useEffect, useMemo, useState } from 'react'

const platforms = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'twitter', label: 'Twitter/X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'tiktok', label: 'TikTok' },
]

export default function AccountsManager() {
  const backend = import.meta.env.VITE_BACKEND_URL || ''
  const api = (p) => `${backend}${p}`

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ platform: 'facebook', page_id: '', page_name: '', access_token: '' })
  const [saving, setSaving] = useState(false)
  const [oauthBusy, setOauthBusy] = useState(false)
  const [oauthMsg, setOauthMsg] = useState('')

  const url = useMemo(() => new URL(window.location.href), [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(api('/api/accounts'))
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const save = async () => {
    if (!form.access_token) return alert('Provide an access token')
    setSaving(true)
    try {
      await fetch(api('/api/accounts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: form.platform,
          page_id: form.page_id || undefined,
          page_name: form.page_name || undefined,
          access_token: form.access_token,
        }),
      })
      setForm({ platform: form.platform, page_id: '', page_name: '', access_token: '' })
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Remove this account?')) return
    try {
      await fetch(api(`/api/accounts/${id}`), { method: 'DELETE' })
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  // --- Meta OAuth ---
  const startMetaOAuth = async () => {
    setOauthBusy(true)
    setOauthMsg('Generating OAuth link…')
    try {
      const res = await fetch(api('/auth/meta/url'))
      if (!res.ok) throw new Error('Failed to get OAuth URL')
      const data = await res.json()
      const authUrl = data?.url
      if (!authUrl) throw new Error('No URL returned')
      window.location.href = authUrl
    } catch (e) {
      console.error(e)
      setOauthMsg('Failed to start OAuth. Check backend env vars.')
      setOauthBusy(false)
    }
  }

  const handleMetaCallback = async () => {
    const isMeta = url.searchParams.get('meta_oauth') === '1'
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    if (!isMeta || !code) return
    setOauthBusy(true)
    setOauthMsg('Finalizing Meta connection…')
    try {
      const res = await fetch(api('/auth/meta/callback'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.detail || 'OAuth callback failed')
      setOauthMsg('Connected with Meta successfully. Tokens saved where applicable.')
      await load()
    } catch (e) {
      console.error(e)
      setOauthMsg('OAuth failed. See console/logs for details.')
    } finally {
      // Clean URL params
      const clean = new URL(window.location.href)
      clean.searchParams.delete('code')
      clean.searchParams.delete('state')
      clean.searchParams.delete('meta_oauth')
      window.history.replaceState({}, '', clean.toString())
      setOauthBusy(false)
      setTimeout(() => setOauthMsg(''), 4000)
    }
  }

  useEffect(() => { handleMetaCallback() }, [])

  return (
    <section className="relative py-14 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Social accounts</h2>
            <p className="mt-1 text-sm text-blue-200/70">Store page tokens once; publishing will auto-use them.</p>
          </div>
          <div className="text-sm text-blue-200/70">{loading ? 'Loading…' : null}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="font-medium">Connect a page</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-blue-200/70 mb-1">Platform</label>
                <select name="platform" value={form.platform} onChange={handleChange} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  {platforms.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-blue-200/70 mb-1">Page ID (optional)</label>
                <input name="page_id" value={form.page_id} onChange={handleChange} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="1234567890" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70 mb-1">Page Name (optional)</label>
                <input name="page_name" value={form.page_name} onChange={handleChange} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="My Business Page" />
              </div>
              <div>
                <label className="block text-sm text-blue-200/70 mb-1">Access Token</label>
                <input name="access_token" value={form.access_token} onChange={handleChange} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="EAAB..." />
              </div>
              <button onClick={save} disabled={saving} className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-2.5">{saving ? 'Saving…' : 'Save'}</button>
              <p className="text-xs text-blue-300/60">Tip: For Meta, create a system user/page token in Business Manager for testing.</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Meta connection</h3>
              {oauthMsg && <span className="text-xs text-blue-300/80">{oauthMsg}</span>}
            </div>
            <p className="mt-2 text-sm text-blue-200/70">Use OAuth to securely connect your Facebook/Instagram assets. We’ll exchange the code for a user token and later fetch Page tokens.</p>
            <button onClick={startMetaOAuth} disabled={oauthBusy} className="mt-4 inline-flex items-center rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2.5">
              {oauthBusy ? 'Working…' : 'Connect with Meta'}
            </button>
            <p className="mt-2 text-xs text-blue-300/60">Ensure your server has META_APP_ID, META_APP_SECRET and META_REDIRECT_URI set. Redirect URI should include ?meta_oauth=1.</p>
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="font-medium">Connected pages</h3>
            <div className="mt-4 divide-y divide-slate-800/80">
              {items.length === 0 && (
                <div className="text-sm text-blue-200/70">No accounts yet.</div>
              )}
              {items.map((it) => (
                <div key={it.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{it.page_name || it.page_id || 'Unknown page'}</div>
                    <div className="text-xs text-blue-300/70">{it.platform} • token {it.access_token ? 'stored' : 'missing'}</div>
                  </div>
                  <button onClick={() => remove(it.id)} className="text-sm rounded-md bg-red-500/10 text-red-300 px-3 py-1.5 hover:bg-red-500/20">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
