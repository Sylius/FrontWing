import React, { useEffect, useRef } from "react";
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
import { useForm } from "@tanstack/react-form";
import { profileSchema } from "@/schemas/account";
import { FieldError } from "@/components/ui/field-error";
import { submitForm } from "@/lib/utils";

const labelClass = "block text-sm font-medium mb-1";

const ProfilePage: React.FC = () => {
  const { customer, refetchCustomer } = useCustomer();
  const { addMessage } = useFlashMessages();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthday: "",
      gender: "u",
      phoneNumber: "",
      subscribedToNewsletter: false,
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${customer?.["@id"]}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify({
            ...value,
            user: {
              username: value.email,
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
    },
  });

  useEffect(() => {
    if (!customer) return;

    form.setFieldValue("firstName", customer.firstName ?? "");
    form.setFieldValue("lastName", customer.lastName ?? "");
    form.setFieldValue("email", customer.email ?? "");
    form.setFieldValue("birthday", customer.birthday?.split(" ")[0] ?? "");
    form.setFieldValue("gender", customer.gender ?? "u");
    form.setFieldValue("phoneNumber", customer.phoneNumber ?? "");
    form.setFieldValue("subscribedToNewsletter", customer.subscribedToNewsletter ?? false);
  }, [customer, form]);

  const loading = !customer;

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
            <form
              ref={formRef}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void submitForm(form, formRef.current);
              }}
            >
              <div className="-mx-3 flex flex-wrap">
                <div className="mb-3 w-full px-3 md:w-1/2">
                  <label className={labelClass}>First name *</label>
                  <form.Field
                    name="firstName"
                    validators={{
                      onSubmit: profileSchema.shape.firstName,
                      onBlur: profileSchema.shape.firstName,
                    }}
                  >
                    {(field) => (
                      <>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                          aria-describedby="firstName-error"
                          aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                        />
                        <FieldError
                          id="firstName-error"
                          errors={field.state.meta.errors}
                          isTouched={field.state.meta.isTouched}
                          isSubmitted={form.state.isSubmitted}
                        />
                      </>
                    )}
                  </form.Field>
                </div>
                <div className="mb-3 w-full px-3 md:w-1/2">
                  <label className={labelClass}>Last name *</label>
                  <form.Field
                    name="lastName"
                    validators={{
                      onSubmit: profileSchema.shape.lastName,
                      onBlur: profileSchema.shape.lastName,
                    }}
                  >
                    {(field) => (
                      <>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                          aria-describedby="lastName-error"
                          aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                        />
                        <FieldError
                          id="lastName-error"
                          errors={field.state.meta.errors}
                          isTouched={field.state.meta.isTouched}
                          isSubmitted={form.state.isSubmitted}
                        />
                      </>
                    )}
                  </form.Field>
                </div>
                <div className="mb-3 w-full px-3">
                  <label className={labelClass}>Email *</label>
                  <form.Field
                    name="email"
                    validators={{
                      onSubmit: profileSchema.shape.email,
                      onBlur: profileSchema.shape.email,
                    }}
                  >
                    {(field) => (
                      <>
                        <Input
                          type="email"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                          aria-describedby="email-error"
                          aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                        />
                        <FieldError
                          id="email-error"
                          errors={field.state.meta.errors}
                          isTouched={field.state.meta.isTouched}
                          isSubmitted={form.state.isSubmitted}
                        />
                      </>
                    )}
                  </form.Field>
                </div>
                <div className="mb-3 w-full px-3 md:w-1/2">
                  <label className={labelClass}>Birthday</label>
                  <form.Field
                    name="birthday"
                    validators={{
                      onSubmit: profileSchema.shape.birthday,
                      onBlur: profileSchema.shape.birthday,
                    }}
                  >
                    {(field) => (
                      <>
                        <Input
                          type="date"
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          aria-describedby="birthday-error"
                          aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                        />
                        <FieldError
                          id="birthday-error"
                          errors={field.state.meta.errors}
                          isTouched={field.state.meta.isTouched}
                          isSubmitted={form.state.isSubmitted}
                        />
                      </>
                    )}
                  </form.Field>
                </div>
                <div className="mb-3 w-full px-3 md:w-1/2">
                  <label className={labelClass}>Gender *</label>
                  <form.Field name="gender">
                    {(field) => (
                      <Select
                        value={field.state.value ?? "u"}
                        onValueChange={(v) => v && field.handleChange(v)}
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
                    )}
                  </form.Field>
                </div>
                <div className="mb-3 w-full px-3">
                  <label className={labelClass}>Phone number</label>
                  <form.Field name="phoneNumber">
                    {(field) => (
                      <Input
                        value={field.state.value ?? ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    )}
                  </form.Field>
                </div>
                <div className="mb-4 w-full px-3">
                  <div className="flex items-center gap-2">
                    <form.Field name="subscribedToNewsletter">
                      {(field) => (
                        <Checkbox
                          id="newsletter"
                          checked={field.state.value ?? false}
                          onCheckedChange={(checked) => field.handleChange(checked === true)}
                        />
                      )}
                    </form.Field>
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
