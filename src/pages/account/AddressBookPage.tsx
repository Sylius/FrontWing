import React, { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import AddressCards from "../../components/account/AddressCards";
import { useCustomer } from "../../context/CustomerContext";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import AccountLayout from "../../layouts/Account";
import Default from "../../layouts/Default";
import { Address } from "../../types/Address";

const getDefaultAddressId = (defaultAddress?: string | { "@id": string } | null): string | null => {
  if (!defaultAddress) return null;
  const addressUrl = typeof defaultAddress === "string" ? defaultAddress : defaultAddress["@id"];
  return addressUrl.split("/").pop() || null;
};

const AddressBookPage: React.FC = () => {
  const { customer } = useCustomer();
  const { addMessage } = useFlashMessages();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch addresses");

      const data = await res.json();
      setAddresses(data["hydra:member"] || []);
    } catch (err) {
      console.error("Error loading addresses", err);
      addMessage("error", "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, [addMessage]);

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete address");

      addMessage("success", "Address deleted");
      fetchAddresses();
    } catch (err) {
      console.error("Error deleting address", err);
      addMessage("error", "Failed to delete address");
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const defaultId = getDefaultAddressId(customer?.defaultAddress);

  const sortedAddresses = [...addresses].sort((a, b) => {
    if (String(a.id) === defaultId) return -1;
    if (String(b.id) === defaultId) return 1;
    return 0;
  });

  return (
    <Default>
      <AccountLayout
        breadcrumbs={[
          { label: "Home", url: "/" },
          { label: "My account", url: "/account/dashboard" },
          { label: "Address book", url: "/account/address-book" },
        ]}
      >
        <div className="w-full md:w-3/4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="mb-1">Address book</h1>
              <div className="text-muted-foreground">Manage your saved addresses</div>
            </div>
            <Link
              to="/account/address-book/add"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded px-4 py-2"
            >
              Add address
            </Link>
          </div>

          {loading ? (
            <Skeleton count={3} height={120} className="mb-3" />
          ) : addresses.length === 0 ? (
            <div className="rounded border border-blue-200 bg-blue-50 p-3 text-blue-800">
              <div className="font-bold">Info</div>
              You have no addresses defined
            </div>
          ) : (
            <AddressCards
              addresses={sortedAddresses}
              onDelete={handleDelete}
              refetchAddresses={fetchAddresses}
            />
          )}
        </div>
      </AccountLayout>
    </Default>
  );
};

export default AddressBookPage;
