import { Order } from "../types/Order";

export const pickupCart = async (): Promise<string> => {
  const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) throw new Error("Failed to create a new cart");

  const data = await response.json();
  return data.tokenValue;
};

export const fetchOrderFromAPI = async (): Promise<Order> => {
  const token = localStorage.getItem("orderToken");
  if (!token) throw new Error("No order token found");

  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${token}`
  );

  if (!response.ok) throw new Error("Failed to fetch order");

  const data = await response.json();
  return data["hydra:member"] || data;
};

export const updateOrderItemAPI = async ({
  id,
  quantity,
}: {
  id: number;
  quantity: number;
}): Promise<void> => {
  const token = localStorage.getItem("orderToken");
  if (!token) throw new Error("No order token found");

  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${token}/items/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/merge-patch+json" },
      body: JSON.stringify({ quantity }),
    }
  );

  if (!response.ok) throw new Error("Failed to update item quantity");
};

export const removeOrderItemAPI = async (id: number): Promise<void> => {
  const token = localStorage.getItem("orderToken");
  if (!token) throw new Error("No order token found");

  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${token}/items/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) throw new Error("Failed to remove item from cart");
};
