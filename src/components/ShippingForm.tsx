import { useState } from 'react'
import useCart from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'

interface ShippingFormProps {
  onSubmit: (data: any) => void
}

export default function ShippingForm({ onSubmit }: ShippingFormProps) {
  const { items } = useCart()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    onSubmit({
      ...formData,
      total
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="zip">ZIP Code</Label>
        <Input
          id="zip"
          name="zip"
          value={formData.zip}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">Continue to Payment</Button>
    </form>
  )
}
