'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.password2) {
      setError('Salasanat eivät täsmää.')
      return
    }
    if (form.password.length < 8) {
      setError('Salasanan tulee olla vähintään 8 merkkiä.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone: form.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError('Rekisteröityminen epäonnistui. Tarkista tiedot ja yritä uudelleen.')
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Tarkista sähköpostisi</CardTitle>
            <CardDescription>
              Lähetimme sinulle vahvistuslinkin osoitteeseen <strong>{form.email}</strong>.
              Klikkaa linkkiä aktivoidaksesi tunnuksesi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">Takaisin kirjautumiseen</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Luo tunnus</CardTitle>
          <CardDescription>Rekisteröidy varausjärjestelmään</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Koko nimi</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="Matti Meikäläinen"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Sähköposti</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="nimi@example.fi"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Puhelinnumero <span className="text-gray-400 font-normal">(valinnainen)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+358 40 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Salasana</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Vähintään 8 merkkiä"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password2">Salasana uudelleen</Label>
              <Input
                id="password2"
                type="password"
                value={form.password2}
                onChange={(e) => set('password2', e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Luodaan tunnusta...' : 'Rekisteröidy'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Onko sinulla jo tunnus?{' '}
            <Link href="/auth/login" className="font-medium underline">
              Kirjaudu sisään
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
