import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import AddressForm, { type AnyFormApi } from "../../components/account/AddressForm";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { addressSchema, AddressValues } from "@/schemas/address";

interface Country {
  code: string;
  name: string;
}

const emptyAddressValues: AddressValues = {
  firstName: "",
  lastName: "",
  company: "",
  street: "",
  countryCode: "",
  provinceName: "",
  city: "",
  postcode: "",
  phoneNumber: "",
};

const AddAddressPage: React.FC = () => {
  const navigate = useNavigate();
  const { addMessage } = useFlashMessages();

  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const form = useForm({
    defaultValues: emptyAddressValues,
    validators: {
      onSubmit: addressSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) throw new Error("Missing token");

        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(value),
        });

        if (!res.ok) throw new Error("Failed to add address");

        addMessage("success", "Address added successfully");
        navigate("/account/address-book");
      } catch (error) {
        console.error("Error submitting address", error);
        addMessage("error", "Failed to add address");
      }
    },
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/countries`);
        const data = await res.json();
        setCountries(data["hydra:member"] || []);
      } catch (error) {
        console.error("Error fetching countries", error);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  return (
    <Default>
      <AccountLayout
        breadcrumbs={[
          { label: "Home", url: "/" },
          { label: "My account", url: "/account/dashboard" },
          { label: "Address book", url: "/account/address-book" },
          { label: "Create", url: "/account/address-book/create" },
        ]}
      >
        <div className="w-full md:w-3/4">
          <div className="mb-4">
            <h1>Address book</h1>
            <p>Add address</p>
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="mb-4">
              <AddressForm
                form={form as unknown as AnyFormApi}
                countries={countries}
                loadingCountries={loadingCountries}
              />
            </div>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(submitting) => (
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/account/address-book")}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form.Subscribe>
          </form>
        </div>
      </AccountLayout>
    </Default>
  );
};

export default AddAddressPage;
