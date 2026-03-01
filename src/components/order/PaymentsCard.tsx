import React from 'react';
import { Payment } from '../../types/Order';
import { formatPrice } from '../../utils/price';

interface PaymentsCardProps {
    payment: Payment;
    total: number;
    paymentState?: string;
}

const PaymentsCard: React.FC<PaymentsCardProps> = ({ payment, total, paymentState }) => {
    return (
        <div className="bg-muted/50 rounded-lg border-0 mb-3">
            <div className="px-4 py-3 border-b flex items-center">
                <div className="mr-auto">Payments</div>
                <div>{paymentState ?? ''}</div>
            </div>

            <div className="p-4 flex flex-col gap-2">
                <div className="flex gap-4">
                    <div className="mr-auto">
                        {typeof payment.method === 'object' && payment.method && 'name' in payment.method
                            ? payment.method.name
                            : ''}
                    </div>
                    <div className="font-medium">${formatPrice(total)}</div>
                    <div>{payment.state ?? ''}</div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsCard;
