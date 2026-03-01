import {useOrder} from "../../../context/OrderContext";
import { formatPrice } from "../../../utils/price";
import {OrderItem} from "../../../types/Order";
import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const Sidebar: React.FC = () => {

    const { order } = useOrder();

    return (
        <div className="w-full lg:w-5/12 py-5 lg:pl-20 relative checkout-sidebar">

            <div>
                <div className="mb-4 text-3xl font-semibold">Summary</div>
                <Table className="mb-3">
                    <TableBody>
                        {order?.items?.map((orderItem: OrderItem) => (
                            <TableRow key={orderItem.id}>
                                <TableCell>
                                    <div className="py-3 text-base font-semibold mb-0 break-words">
                                        { orderItem.productName }
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="py-3 text-right text-muted-foreground">
                                        { orderItem.quantity }
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="py-3 text-right">
                                        ${ formatPrice(orderItem.subtotal) }
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Table className="mb-3">
                    <TableBody>
                    <TableRow>
                        <TableCell>Items total:</TableCell>
                        <TableCell className="text-right">${formatPrice(order?.itemsSubtotal)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Estimated shipping cost:</TableCell>
                        <TableCell className="text-right">
                            <span>${formatPrice(order?.shippingTotal)}</span>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="pb-4">
                            Taxes total:
                        </TableCell>
                        <TableCell className="pb-4 text-right">
                            <div>${formatPrice(order?.taxTotal)}</div>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="border-t pt-4 text-xl font-semibold">Order total:</TableCell>
                        <TableCell className="border-t pt-4 text-right text-xl font-semibold">${formatPrice(order?.total)}</TableCell>
                    </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
)
};

export default Sidebar;
