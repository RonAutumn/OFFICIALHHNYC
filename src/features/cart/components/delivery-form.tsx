import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { useCart } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';

interface DeliveryFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({ onSubmit, onBack, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<DeliveryFormData>();
  const { toast } = useToast();
  const { items, getTotal } = useCart();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Input
              id="state"
              className="bg-gray-800 border-gray-700 text-gray-200"
              placeholder="Enter your state"
              {...register("state", { required: "State is required" })}
            />
            {errors.state && <span className="text-xs text-red-400">{errors.state.message}</span>}
          </div>
        </div>

        <div>
          <Label htmlFor="zipCode" className="text-sm text-gray-300">Zip Code</Label>
          <Input
            id="zipCode"
            className="bg-gray-800 border-gray-700 text-gray-200"
            placeholder="Enter your zip code"
            {...register("zipCode", { required: "Zip code is required" })}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
        <div className="flex justify-between text-sm text-gray-300 mt-4">
          <span>Total</span>
          <span>{formatCurrency(getTotal())}</span>
        </div>
      </div>
    </form>
  );
};
