import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shipment } from '../../types/Order';
import { useQuery } from '@tanstack/react-query';

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
  const { t } = useTranslation("account");
  const methodRef = typeof shipment?.method === 'string' ? shipment.method : undefined;

  const fetchShippingMethodFromAPI = async (): Promise<ShippingMethod> => {
    const response = await fetch(
        `${window.ENV?.API_URL}${methodRef}`
    );
    if (!response.ok) {
      throw new Error('Error downloading shipping method');
    }

    return response.json();
  };

  const { data: shippingMethod } = useQuery<ShippingMethod>({
    queryKey: ['shipping-method', methodRef],
    queryFn: fetchShippingMethodFromAPI,
    enabled: Boolean(methodRef),
  });

  return (
      <div className="card border-0 bg-body-tertiary mb-3">
        <div className="card-header d-flex align-items-center">
          <div className="me-auto">{t("orders.details.shipments")}</div>
        </div>
        <div className="card-body d-flex flex-column gap-2">
          <div className="d-flex gap-4">
            <div className="me-auto">{shippingMethod?.name}</div>
          </div>
        </div>
      </div>
  );
};

export default ShipmentsCard;
