'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MoreHorizontal, Pencil, Trash2, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface Props {
  sessionId: string
  status: string
}

export function SessionActions({ sessionId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function cancelSession() {
    if (!confirm('Perutaanko tämä tunti? Asiakkaille lähetetään ilmoitus.')) return
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('class_sessions')
      .update({ status: 'cancelled' })
      .eq('id', sessionId)
    router.refresh()
    setLoading(false)
  }

  async function deleteSession() {
    if (!confirm('Poistetaanko tämä tunti pysyvästi?')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('class_sessions').delete().eq('id', sessionId)
    router.refresh()
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="w-full flex justify-center text-gray-400 hover:text-gray-600 pt-1" disabled={loading}>
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-sm">
        <DropdownMenuItem onClick={() => router.push(`/admin/tunnit/${sessionId}/muokkaa`)} className="flex items-center gap-2">
          <Pencil className="w-3 h-3" /> Muokkaa
        </DropdownMenuItem>
        {status === 'scheduled' && (
          <DropdownMenuItem onClick={cancelSession} className="flex items-center gap-2 text-orange-600">
            <XCircle className="w-3 h-3" /> Peru tunti
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={deleteSession} className="flex items-center gap-2 text-red-600">
          <Trash2 className="w-3 h-3" /> Poista
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
