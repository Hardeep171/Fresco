import { useState, useEffect, useCallback, useMemo } from "react";
import { useAddress } from "./useAddress";
import { useCart } from "./useCart";
import { Address, CreateAddressInput } from "../types/address.types";
import { CreateOrderInput } from "../types/order.types";

/**
 * Hook to manage customer checkout configuration, address selections, and schedule dates.
 */
export function useCheckout() {
  const { addresses, defaultAddress, loadAddresses } = useAddress();
  const { cart, items, totalAmount } = useCart();

  const [pickupAddress, setPickupAddress] = useState<Address | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);

  // Date selection states (ISO strings)
  const defaultPickupDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Tomorrow
    d.setHours(10, 0, 0, 0);
    return d.toISOString();
  }, []);

  const defaultDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3); // 3 days later
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  }, []);

  const [pickupDate, setPickupDate] = useState<string>(defaultPickupDate);
  const [deliveryDate, setDeliveryDate] = useState<string>(defaultDeliveryDate);
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  // Load user addresses on mount
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Pre-fill with default address when available
  useEffect(() => {
    if (defaultAddress) {
      if (!pickupAddress) setPickupAddress(defaultAddress);
      if (!deliveryAddress || useSameAddress) setDeliveryAddress(defaultAddress);
    } else if (addresses.length > 0 && addresses[0]) {
      if (!pickupAddress) setPickupAddress(addresses[0]);
      if (!deliveryAddress || useSameAddress) setDeliveryAddress(addresses[0]);
    }
  }, [defaultAddress, addresses, pickupAddress, deliveryAddress, useSameAddress]);

  // Sync delivery address when useSameAddress is true
  useEffect(() => {
    if (useSameAddress && pickupAddress) {
      setDeliveryAddress(pickupAddress);
    }
  }, [useSameAddress, pickupAddress]);

  const mapToCreateAddressInput = useCallback(
    (addr: Address): CreateAddressInput => {
      return {
        label: addr.label,
        fullName: addr.fullName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        landmark: addr.landmark,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country || "India",
        latitude: addr.latitude,
        longitude: addr.longitude,
      };
    },
    []
  );

  const canProceedToReview = useMemo(() => {
    const hasItems = items.length > 0;
    const hasPickupAddr = pickupAddress !== null;
    const hasDeliveryAddr = deliveryAddress !== null;
    return hasItems && hasPickupAddr && hasDeliveryAddr;
  }, [items, pickupAddress, deliveryAddress]);

  const buildOrderPayload = useCallback((): CreateOrderInput | null => {
    if (!pickupAddress || !deliveryAddress || items.length === 0) {
      return null;
    }

    return {
      pickupAddress: mapToCreateAddressInput(pickupAddress),
      deliveryAddress: mapToCreateAddressInput(deliveryAddress),
      pickupDate,
      deliveryDate,
      specialInstructions: specialInstructions.trim() || undefined,
    };
  }, [
    pickupAddress,
    deliveryAddress,
    items,
    pickupDate,
    deliveryDate,
    specialInstructions,
    mapToCreateAddressInput,
  ]);

  return {
    addresses,
    defaultAddress,
    pickupAddress,
    setPickupAddress,
    deliveryAddress,
    setDeliveryAddress,
    useSameAddress,
    setUseSameAddress,
    pickupDate,
    setPickupDate,
    deliveryDate,
    setDeliveryDate,
    specialInstructions,
    setSpecialInstructions,
    cart,
    items,
    totalAmount,
    canProceedToReview,
    buildOrderPayload,
  };
}
