import React from "react";
import { Shipment } from "../../types/Order";
import { useQuery } from "@tanstack/react-query";

interface ShippingMethod {
  id: number;
  code: string;
  name: string;
  description?: string;
  price?: number;
}

interface ShipmentsCardProps {
  shipment: Shipment;
}

const ShipmentsCard: React.FC<ShipmentsCardProps> = ({ shipment }) => {
  const fetchShippingMethodFromAPI = async (): Promise<ShippingMethod> => {
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${shipment.method}`);
    if (!response.ok) {
      throw new Error("Error downloading shipping method");
    }

    return response.json();
  };

  const { data: shippingMethod } = useQuery<ShippingMethod>({
    queryKey: ["shipping-method", shipment.method],
    queryFn: fetchShippingMethodFromAPI,
  });

  return (
    <div className="bg-muted/50 mb-3 rounded-lg border-0">
      <div className="flex items-center border-b px-4 py-3">
        <div className="mr-auto">Shipments</div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex gap-4">
          <div className="mr-auto">{shippingMethod?.name}</div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentsCard;
