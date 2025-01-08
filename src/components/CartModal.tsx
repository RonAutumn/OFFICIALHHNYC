import { useState } from 'react'
import useCart from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import DeliveryForm from './DeliveryForm'
import ShippingForm from './ShippingForm'
import { OrderType } from '@/types/product'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, setOrderType } = useCart()
  const [step, setStep] = useState<'cart' | 'delivery' | 'shipping'>('cart')

  const handleDeliverySubmit = (data: any) => {
    setOrderType('delivery')
    // Handle delivery form submission
  }

  const handleShippingSubmit = (data: any) => {
    setOrderType('shipping')
    // Handle shipping form submission
  }

  const handleBack = () => {
    setStep('cart')
  }

  const subtotal = items.reduce((total, item) => {
    const price = item.selectedVariation?.price || item.price
    return total + (price * item.quantity)
  }, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 'cart' && 'Your Cart'}
            {step === 'delivery' && 'Delivery Details'}
            {step === 'shipping' && 'Shipping Details'}
          </DialogTitle>
        </DialogHeader>

        {step === 'cart' && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.selectedVariation && (
                          <p className="text-sm text-gray-500">
                            {item.selectedVariation.name}
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          >
                            -
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>{formatCurrency((item.selectedVariation?.price || item.price) * item.quantity)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={() => setStep('delivery')} className="flex-1">
                    Delivery
                  </Button>
                  <Button onClick={() => setStep('shipping')} className="flex-1">
                    Shipping
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'delivery' && (
          <DeliveryForm onSubmit={handleDeliverySubmit} onBack={handleBack} />
        )}

        {step === 'shipping' && (
          <ShippingForm onSubmit={handleShippingSubmit} onBack={handleBack} />
        )}
      </DialogContent>
    </Dialog>
  )
}