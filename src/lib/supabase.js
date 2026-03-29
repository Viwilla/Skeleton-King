import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://kbsrmpglrdnsiwqfbpon.supabase.co',
  'sb_publishable_b6q277k81WYjspEpEK8sDQ_K3tsiSYG',
  { db: { schema: 'public' } }
)

export function getDeviceId() {
  let id = localStorage.getItem('skull_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('skull_device_id', id)
  }
  return id
}

export function generateRoomCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase()
}
