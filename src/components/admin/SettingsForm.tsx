'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tenant, TenantSettings } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  tenant: Tenant
}

export function SettingsForm({ tenant }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const settings = tenant.settings as unknown as TenantSettings

  const [name, setName] = useState(tenant.name)
  const [primaryColor, setPrimaryColor] = useState(tenant.primary_color)
  const [secondaryColor, setSecondaryColor] = useState(tenant.secondary_color)
  const [cancelHours, setCancelHours] = useState(String(settings.cancellation_hours))
  const [bookingCloses, setBookingCloses] = useState(String(settings.booking_closes_minutes))
  const [minParticipants, setMinParticipants] = useState(String(settings.min_participants_class))
  const [minWorkshop, setMinWorkshop] = useState(String(settings.min_participants_workshop))
  const [waitlistHours, setWaitlistHours] = useState(String(settings.waitlist_accept_hours))

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('tenants').update({
      name,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      settings: {
        ...settings,
        cancellation_hours: parseInt(cancelHours),
        booking_closes_minutes: parseInt(bookingCloses),
        min_participants_class: parseInt(minParticipants),
        min_participants_workshop: parseInt(minWorkshop),
        waitlist_accept_hours: parseInt(waitlistHours),
      },
    }).eq('id', tenant.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <Tabs defaultValue="yleiset">
      <TabsList className="mb-4">
        <TabsTrigger value="yleiset">Yleiset</TabsTrigger>
        <TabsTrigger value="ulkoasu">Ulkoasu</TabsTrigger>
        <TabsTrigger value="varaukset">Varausasetukset</TabsTrigger>
      </TabsList>

      <TabsContent value="yleiset">
        <Card>
          <CardHeader><CardTitle className="text-base">Studion tiedot</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Studion nimi</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ulkoasu">
        <Card>
          <CardHeader><CardTitle className="text-base">Brändivärit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pääväri</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono w-32" />
                <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Toissijainen väri</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="font-mono w-32" />
                <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: secondaryColor }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="varaukset">
        <Card>
          <CardHeader><CardTitle className="text-base">Varaus- ja peruutussäännöt</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peruutusaika (tuntia ennen)</Label>
                <Input type="number" min="1" value={cancelHours} onChange={(e) => setCancelHours(e.target.value)} />
                <p className="text-xs text-gray-500">Tätä myöhemmin peruutus menettää kreditin</p>
              </div>
              <div className="space-y-2">
                <Label>Varaus sulkeutuu (min ennen)</Label>
                <Input type="number" min="0" value={bookingCloses} onChange={(e) => setBookingCloses(e.target.value)} />
                <p className="text-xs text-gray-500">Kuinka monta minuuttia ennen tuntia varaus sulkeutuu</p>
              </div>
              <div className="space-y-2">
                <Label>Min. osallistujat (tunti)</Label>
                <Input type="number" min="1" value={minParticipants} onChange={(e) => setMinParticipants(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Min. osallistujat (workshop)</Label>
                <Input type="number" min="1" value={minWorkshop} onChange={(e) => setMinWorkshop(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Jonopaikan hyväksymisaika (tuntia)</Label>
                <Input type="number" min="1" value={waitlistHours} onChange={(e) => setWaitlistHours(e.target.value)} />
                <p className="text-xs text-gray-500">Aika jona jonossa oleva voi hyväksyä vapautuneen paikan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <Button onClick={save} disabled={saving} className="mt-4">
        {saving ? 'Tallennetaan...' : saved ? 'Tallennettu ✓' : 'Tallenna asetukset'}
      </Button>
    </Tabs>
  )
}
