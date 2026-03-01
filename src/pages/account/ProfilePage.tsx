import React, { useEffect, useState } from "react";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import { useCustomer } from "../../context/CustomerContext";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import Skeleton from "react-loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const labelClass = "block text-sm font-medium mb-1";

const ProfilePage: React.FC = () => {
  const { customer, refetchCustomer } = useCustomer();
  const { addMessage } = useFlashMessages();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthday: "",
    gender: "u",
    phoneNumber: "",
    subscribedToNewsletter: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) return;

    setFormData({
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      email: customer.email ?? "",
      birthday: customer.birthday?.split(" ")[0] ?? "",
      gender: customer.gender ?? "u",
      phoneNumber: customer.phoneNumber ?? "",
      subscribedToNewsletter: customer.subscribedToNewsletter ?? false,
    });
    setLoading(false);
  }, [customer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleNewsletterChange = (checked: boolean | "indeterminate") => {
    setFormData((prev) => ({ ...prev, subscribedToNewsletter: checked === true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${customer?.["@id"]}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
          ...formData,
          user: {
            username: formData.email,
            enabled: true,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      await refetchCustomer();
      addMessage("success", "Profile updated successfully");
    } catch (err) {
      addMessage("error", "Error updating profile");
      console.error(err);
    }
  };

  return (
    <Default>
      <AccountLayout
        breadcrumbs={[
          { label: "Home", url: "/" },
          { label: "My account", url: "/account/dashboard" },
          { label: "Personal information", url: "/account/profile/edit" },
        ]}
      >
        <div className="w-full md:w-3/4">
          <div className="mb-4">
            <h1>Your profile</h1>
            Edit your personal information
          </div>

          {loading ? (
            <Skeleton count={12} height={36} className="mb-2" />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="-mx-3 flex flex-wrap">
                <div className="mb-3 w-full px-3 md:w-1/2">
                  <label className={labelClass}>First name *</label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3 w-full px-3 md:w-1/2">
                  <label className={labelClass}>Last name *</label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3 w-full px-3">
                  <label className={labelClass}>Email *</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3 w-full px-3 md:w-1/2">
                  <label className={labelClass}>Birthday</label>
                  <Input
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3 w-full px-3 md:w-1/2">
                  <label className={labelClass}>Gender *</label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) => v && handleGenderChange(v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">Male</SelectItem>
                      <SelectItem value="f">Female</SelectItem>
                      <SelectItem value="u">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-3 w-full px-3">
                  <label className={labelClass}>Phone number</label>
                  <Input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-4 w-full px-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.subscribedToNewsletter}
                      onCheckedChange={handleNewsletterChange}
                    />
                    <label htmlFor="newsletter" className="text-sm">
                      Subscribe to the newsletter
                    </label>
                  </div>
                </div>
              </div>

              <Button type="submit">Save changes</Button>
            </form>
          )}
        </div>
      </AccountLayout>
    </Default>
  );
};

export default ProfilePage;
