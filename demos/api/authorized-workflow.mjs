// Created by https://once-email.com
const baseUrl = process.env.ONCE_EMAIL_API_URL || 'https://api.once-email.com/v1'
const apiKey = process.env.ONCE_EMAIL_API_KEY
if (!apiKey) throw new Error('Set ONCE_EMAIL_API_KEY through your process secret facility.')
async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, redirect: 'error', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...options.headers } })
  if (!response.ok) throw new Error(`Once Email request failed (${response.status})`)
  return response.status === 204 ? undefined : response.json()
}
let inbox
try {
  inbox = await request('/inboxes', { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() }, body: '{}' })
  const messages = await request(`/inboxes/${encodeURIComponent(inbox.id)}/messages?pageSize=20`)
  console.log(JSON.stringify({ created: true, messageCount: messages.items.length }))
} finally {
  if (inbox?.id) await request(`/inboxes/${encodeURIComponent(inbox.id)}`, { method: 'DELETE' })
}
