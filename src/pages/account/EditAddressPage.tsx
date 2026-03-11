import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useParams } from "react-router-dom";
import AddressForm, { type AnyFormApi } from "../../components/account/AddressForm";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import AccountLayout from "../../layouts/Account";
import Default from "../../layouts/Default";
import { useForm } from "@tanstack/react-form";
import { addressSchema, AddressValues } from "@/schemas/address";
import { submitForm } from "@/lib/utils";

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

const EditAddressPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addMessage } = useFlashMessages();
  const formRef = useRef<HTMLFormElement>(null);

  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    defaultValues: emptyAddressValues,
    validators: {
      onSubmit: addressSchema,
      onBlur: addressSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(value),
          }
        );

        if (!res.ok) throw new Error("Failed to update address");

        addMessage("success", "Address updated successfully");
        navigate("/account/address-book");
      } catch (error) {
        console.error("Error updating address", error);
        addMessage("error", "Failed to update address");
      } finally {
        setSubmitting(false);
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

    const fetchAddress = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch address");
        const data = await res.json();

        const existingAddress: AddressValues = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          company: data.company || "",
          street: data.street || "",
          countryCode: data.countryCode || "",
          provinceName: data.provinceName || "",
          city: data.city || "",
          postcode: data.postcode || "",
          phoneNumber: data.phoneNumber || "",
        };

        form.setFieldValue("firstName", existingAddress.firstName);
        form.setFieldValue("lastName", existingAddress.lastName);
        form.setFieldValue("company", existingAddress.company);
        form.setFieldValue("street", existingAddress.street);
        form.setFieldValue("countryCode", existingAddress.countryCode);
        form.setFieldValue("provinceName", existingAddress.provinceName);
        form.setFieldValue("city", existingAddress.city);
        form.setFieldValue("postcode", existingAddress.postcode);
        form.setFieldValue("phoneNumber", existingAddress.phoneNumber);
      } catch (err) {
        console.error("Error loading address", err);
        addMessage("error", "Failed to load address");
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchCountries();
    fetchAddress();
  }, [id, addMessage, form]);

  return (
    <Default>
      <AccountLayout
        breadcrumbs={[
          { label: "Home", url: "/" },
          { label: "My account", url: "/account/dashboard" },
          { label: "Address book", url: "/account/address-book" },
          { label: "Edit", url: `/account/address-book/edit/${id}` },
        ]}
      >
        <div className="w-full md:w-3/4">
          <div className="mb-4">
            <h1>Address book</h1>
            <p>Edit my address</p>
          </div>

          {loadingAddress ? (
            <Skeleton count={10} height={36} className="mb-2" />
          ) : (
            <form
              ref={formRef}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void submitForm(form, formRef.current);
              }}
            >
              <div className="mb-4">
                <AddressForm
                  form={form as unknown as AnyFormApi}
                  countries={countries}
                  loadingCountries={loadingCountries}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/account/address-book")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </AccountLayout>
    </Default>
  );
};

export default EditAddressPage;
