/**
 * 开发时走 Vite proxy /api → 后端；生产若同域部署则仍用 /api。
 */
const base = import.meta.env.VITE_API_BASE || ''

export async function generatePtfDocx(payload) {
  const res = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText || '请求失败')
  }
  return res.blob()
}
