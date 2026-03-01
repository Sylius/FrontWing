import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import AddressForm from "../../components/account/AddressForm";
import { Button } from "@/components/ui/button";

interface Country {
  code: string;
  name: string;
}

const AddAddressPage: React.FC = () => {
  const navigate = useNavigate();
  const { addMessage } = useFlashMessages();

  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    street: "",
    countryCode: "",
    provinceName: "",
    city: "",
    postcode: "",
    phoneNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, countryCode: value }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = "Required";
    if (!formData.lastName.trim()) e.lastName = "Required";
    if (!formData.street.trim()) e.street = "Required";
    if (!formData.city.trim()) e.city = "Required";
    if (!formData.postcode.trim()) e.postcode = "Required";
    if (!formData.countryCode.trim()) e.countryCode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("Missing token");

      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to add address");

      addMessage("success", "Address added successfully");
      navigate("/account/address-book");
    } catch (error) {
      console.error("Error submitting address", error);
      addMessage("error", "Failed to add address");
    } finally {
      setSubmitting(false);
    }
  };

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

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <AddressForm
                formData={formData}
                countries={countries}
                loadingCountries={loadingCountries}
                onChange={handleChange}
                onCountryChange={handleCountryChange}
                errors={errors}
                submitted={submitted}
              />
            </div>

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
          </form>
        </div>
      </AccountLayout>
    </Default>
  );
};

export default AddAddressPage;
