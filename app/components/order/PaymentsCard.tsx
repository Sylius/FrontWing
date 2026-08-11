import React from 'react';
import { useTranslation } from 'react-i18next';
import { Payment } from '../../types/Order';
import { useCurrency } from "~/context/ChannelContext";

interface PaymentsCardProps {
    payment: Payment;
    total: number;
    paymentState?: string;
}

const PaymentsCard: React.FC<PaymentsCardProps> = ({ payment, total, paymentState }) => {
    const { t } = useTranslation("account");
    const { formatPrice } = useCurrency();
    return (
        <div className="card border-0 bg-body-tertiary mb-3">
            <div className="card-header d-flex align-items-center">
                <div className="me-auto">{t("orders.details.payments")}</div>
                <div>{paymentState ?? ''}</div>
            </div>

            <div className="card-body d-flex flex-column gap-2">
                <div className="d-flex gap-4">
                    <div className="me-auto">
                        {typeof payment.method === 'object' && payment.method && 'name' in payment.method
                            ? payment.method.name
                            : ''}
                    </div>
                    <div className="fw-medium">{formatPrice(total)}</div>
                    <div>{payment.state ?? ''}</div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsCard;
