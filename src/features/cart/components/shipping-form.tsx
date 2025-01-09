import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useCart } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useShipping, US_STATES, type ShippingFormData } from '../hooks/useShipping';

export interface ShippingFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({ onSubmit, onBack, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ShippingFormData>();
  const { items, getSubtotal } = useCart();
  const selectedState = watch('state');
  const { isLoading, shippingFee, freeShippingMinimum, calculateShippingFee, formatOrderData } = useShipping();

  const handleStateSelect = (value: string) => {
    setValue('state', value);
  };

  const subtotal = getSubtotal();
  const fee = calculateShippingFee(subtotal);
  const total = subtotal + fee;

  const onFormSubmit = (data: ShippingFormData) => {
    // Format items as a string for Airtable
    const itemsText = items.map(item => 
      `${item.name}${item.selectedVariation ? ` (${item.selectedVariation})` : ''} x${item.quantity}`
    ).join(', ');

    const formattedData = formatOrderData(data, itemsText, total);
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4 space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm text-gray-300">Name</Label>
          <Input
            id="name"
            className="bg-gray-800 border-gray-700 text-gray-200"
            placeholder="Enter your name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm text-gray-300">Email</Label>
          <Input
            id="email"
            type="email"
            className="bg-gray-800 border-gray-700 text-gray-200"
            placeholder="Enter your email"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm text-gray-300">Phone</Label>
          <Input
            id="phone"
            className="bg-gray-800 border-gray-700 text-gray-200"
            placeholder="Enter your phone number"
            {...register("phone", { required: "Phone number is required" })}
          />
          {errors.phone && <span className="text-xs text-red-400">{errors.phone.message}</span>}
        </div>

        <div>
          <Label htmlFor="address" className="text-sm text-gray-300">Street Address</Label>
          <Input
            id="address"
            className="bg-gray-800 border-gray-700 text-gray-200"
            placeholder="Enter your street address"
            {...register("address", { required: "Street address is required" })}
          />
          {errors.address && <span className="text-xs text-red-400">{errors.address.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="text-sm text-gray-300">City</Label>
            <Input
              id="city"
              className="bg-gray-800 border-gray-700 text-gray-200"
              placeholder="Enter your city"
              {...register("city", { required: "City is required" })}
            />
            {errors.city && <span className="text-xs text-red-400">{errors.city.message}</span>}
          </div>

          <div>
            <Label htmlFor="state" className="text-sm text-gray-300">State</Label>
            <Select value={selectedState} onValueChange={handleStateSelect}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && <span className="text-xs text-red-400">{errors.state.message}</span>}
          </div>
        </div>

        <div>
          <Label htmlFor="zipCode" className="text-sm text-gray-300">ZIP Code</Label>
          <Input
            id="zipCode"
            className="bg-gray-800 border-gray-700 text-gray-200"
            placeholder="Enter your zip code"
            {...register("zipCode", { required: "ZIP code is required" })}
          />
          {errors.zipCode && <span className="text-xs text-red-400">{errors.zipCode.message}</span>}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-700 mt-4">
        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
        <div className="flex justify-between text-sm text-gray-300 mt-4">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-300">
          <span>Shipping Fee</span>
          <span>{formatCurrency(fee)}</span>
        </div>
        {subtotal < freeShippingMinimum && (
          <div className="text-sm text-muted-foreground mt-1">
            Add {formatCurrency(freeShippingMinimum - subtotal)} more for free shipping
          </div>
        )}
        <div className="flex justify-between font-medium pt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </form>
  );
};
