import { useEffect, useState } from 'react'

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
