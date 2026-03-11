import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addressSchema, AddressValues } from "@/schemas/address";
import { FieldError } from "@/components/ui/field-error";
import { submitForm } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Steps from "../../components/checkout/Steps";
import { useCustomer } from "../../context/CustomerContext";
import { useOrder } from "../../context/OrderContext";
import CheckoutLayout from "../../layouts/Checkout";

interface Country {
  code: string;
  name: string;
}

const emptyAddress: AddressValues = {
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

const labelClass = "block text-sm font-medium mb-1";

const AddressPage: React.FC = () => {
  const { customer } = useCustomer();
  const { order, fetchOrder } = useOrder();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const [addresses, setAddresses] = useState<(AddressValues & { id?: number })[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const isInitialized = useRef(false);

  const form = useForm({
    defaultValues: {
      email: "",
      billingAddress: emptyAddress,
      useDifferentShipping: false,
      shippingAddress: emptyAddress,
    },
    validators: {
      onSubmit: ({ value }) => {
        const fields: Record<string, string> = {};

        if (!customer && !value.email?.trim()) {
          fields["email"] = "Email is required";
        }

        const billingResult = addressSchema.safeParse(value.billingAddress);
        if (!billingResult.success) {
          for (const issue of billingResult.error.issues) {
            const key = issue.path[0];
            if (key) fields[`billingAddress.${key}`] = issue.message;
          }
        }

        if (value.useDifferentShipping) {
          const shippingResult = addressSchema.safeParse(value.shippingAddress);
          if (!shippingResult.success) {
            for (const issue of shippingResult.error.issues) {
              const key = issue.path[0];
              if (key) fields[`shippingAddress.${key}`] = issue.message;
            }
          }
        }

        if (Object.keys(fields).length > 0) return { fields };
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${localStorage.getItem("orderToken")}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: customer?.email ?? value.email,
              billingAddress: value.billingAddress,
              shippingAddress: value.useDifferentShipping
                ? value.shippingAddress
                : value.billingAddress,
              couponCode: null,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to submit order");

        await fetchOrder();
        navigate("/checkout/select-shipping");
      } catch (err) {
        console.error("Order submission error:", err);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("jwtToken");

      try {
        const [addressesRes, countriesRes] = await Promise.all([
          token
            ? fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ json: () => ({ "hydra:member": [] }) }),
          fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/countries`),
        ]);

        const addressData = await addressesRes.json();
        const countryData = await countriesRes.json();

        const addressItems = (addressData["hydra:member"] ?? []) as (AddressValues & {
          id?: number;
        })[];
        const countryItems = (countryData["hydra:member"] ?? []) as Country[];

        setAddresses(addressItems);
        setCountries(countryItems);

        if (!isInitialized.current) {
          // Wait until we have enough context to decide (order loaded or customer loaded or guest)
          const canInitialize = order !== undefined || customer !== null || !token;
          if (!canInitialize) return;

          if (order?.billingAddress) {
            const ba = order.billingAddress;
            form.setFieldValue("billingAddress", {
              firstName: ba.firstName ?? "",
              lastName: ba.lastName ?? "",
              company: ba.company ?? "",
              street: ba.street ?? "",
              countryCode: ba.countryCode ?? "",
              provinceName: ba.provinceName ?? "",
              city: ba.city ?? "",
              postcode: ba.postcode ?? "",
              phoneNumber: ba.phoneNumber ?? "",
            });
          } else if (token && customer) {
            const defaultAddressId =
              typeof customer.defaultAddress === "string"
                ? customer.defaultAddress.split("/").pop()
                : customer.defaultAddress?.["@id"]?.split("/").pop();

            const defaultAddress =
              addressItems.find((addr) => String(addr.id) === defaultAddressId) ?? addressItems[0];

            if (defaultAddress) {
              form.setFieldValue("billingAddress", {
                firstName: defaultAddress.firstName ?? "",
                lastName: defaultAddress.lastName ?? "",
                company: defaultAddress.company ?? "",
                street: defaultAddress.street ?? "",
                countryCode: defaultAddress.countryCode ?? "",
                provinceName: defaultAddress.provinceName ?? "",
                city: defaultAddress.city ?? "",
                postcode: defaultAddress.postcode ?? "",
                phoneNumber: defaultAddress.phoneNumber ?? "",
              });
            }
          }

          if (order?.shippingAddress) {
            const sa = order.shippingAddress;
            form.setFieldValue("useDifferentShipping", true);
            form.setFieldValue("shippingAddress", {
              firstName: sa.firstName ?? "",
              lastName: sa.lastName ?? "",
              company: sa.company ?? "",
              street: sa.street ?? "",
              countryCode: sa.countryCode ?? "",
              provinceName: sa.provinceName ?? "",
              city: sa.city ?? "",
              postcode: sa.postcode ?? "",
              phoneNumber: sa.phoneNumber ?? "",
            });
          }

          isInitialized.current = true;
        }
      } catch (error) {
        console.error("Error loading addresses or countries", error);
      }
    };

    fetchData();
  }, [customer, order, form]);

  const handleAddressBookSelect =
    (prefix: "billingAddress" | "shippingAddress") => (selectedId: string) => {
      const selected = addresses.find((addr) => String(addr.id) === selectedId);
      if (selected) {
        form.setFieldValue(prefix, {
          firstName: selected.firstName ?? "",
          lastName: selected.lastName ?? "",
          company: selected.company ?? "",
          street: selected.street ?? "",
          countryCode: selected.countryCode ?? "",
          provinceName: selected.provinceName ?? "",
          city: selected.city ?? "",
          postcode: selected.postcode ?? "",
          phoneNumber: selected.phoneNumber ?? "",
        });
      }
    };

  const renderAddressFields = (prefix: "billingAddress" | "shippingAddress") => (
    <>
      {addresses.length > 0 && (
        <div className="mb-3">
          <label className={labelClass}>Select address from my book</label>
          <Select
            onValueChange={(v) => {
              if (typeof v === "string") handleAddressBookSelect(prefix)(v);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select address from my book" />
            </SelectTrigger>
            <SelectContent>
              {addresses.map((addr) => {
                const countryName =
                  countries.find((c) => c.code === addr.countryCode)?.name || addr.countryCode;
                return (
                  <SelectItem key={addr.id} value={String(addr.id)}>
                    {addr.firstName} {addr.lastName}, {addr.street}, {addr.city} {addr.postcode},{" "}
                    {countryName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="-mx-3 flex flex-wrap">
        <div className="mb-3 w-full px-3 md:w-1/2">
          <label
            className={`${labelClass} after:text-destructive after:ml-0.5 after:content-['*']`}
          >
            First name
          </label>
          <form.Field
            name={`${prefix}.firstName`}
            validators={{
              onBlur: addressSchema.shape.firstName,
              onSubmit: addressSchema.shape.firstName,
            }}
          >
            {(field) => (
              <>
                <Input
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-describedby={`${prefix}-firstName-error`}
                  aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                />
                <FieldError
                  id={`${prefix}-firstName-error`}
                  errors={field.state.meta.errors}
                  isTouched={field.state.meta.isTouched}
                  isSubmitted={form.state.isSubmitted}
                />
              </>
            )}
          </form.Field>
        </div>
        <div className="mb-3 w-full px-3 md:w-1/2">
          <label
            className={`${labelClass} after:text-destructive after:ml-0.5 after:content-['*']`}
          >
            Last name
          </label>
          <form.Field
            name={`${prefix}.lastName`}
            validators={{
              onBlur: addressSchema.shape.lastName,
              onSubmit: addressSchema.shape.lastName,
            }}
          >
            {(field) => (
              <>
                <Input
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-describedby={`${prefix}-lastName-error`}
                  aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                />
                <FieldError
                  id={`${prefix}-lastName-error`}
                  errors={field.state.meta.errors}
                  isTouched={field.state.meta.isTouched}
                  isSubmitted={form.state.isSubmitted}
                />
              </>
            )}
          </form.Field>
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Company</label>
        <form.Field name={`${prefix}.company`}>
          {(field) => (
            <Input
              value={field.state.value ?? ""}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </div>

      <div className="mb-3">
        <label className={`${labelClass} after:text-destructive after:ml-0.5 after:content-['*']`}>
          Street address
        </label>
        <form.Field
          name={`${prefix}.street`}
          validators={{ onBlur: addressSchema.shape.street, onSubmit: addressSchema.shape.street }}
        >
          {(field) => (
            <>
              <Input
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-describedby={`${prefix}-street-error`}
                aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
              />
              <FieldError
                id={`${prefix}-street-error`}
                errors={field.state.meta.errors}
                isTouched={field.state.meta.isTouched}
                isSubmitted={form.state.isSubmitted}
              />
            </>
          )}
        </form.Field>
      </div>

      <div className="mb-3">
        <label className={`${labelClass} after:text-destructive after:ml-0.5 after:content-['*']`}>
          Country
        </label>
        <form.Field
          name={`${prefix}.countryCode`}
          validators={{
            onBlur: addressSchema.shape.countryCode,
            onSubmit: addressSchema.shape.countryCode,
          }}
        >
          {(field) => (
            <>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val ?? "")}
                required
              >
                <SelectTrigger
                  aria-describedby={`${prefix}-countryCode-error`}
                  aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError
                id={`${prefix}-countryCode-error`}
                errors={field.state.meta.errors}
                isTouched={field.state.meta.isTouched}
                isSubmitted={form.state.isSubmitted}
              />
            </>
          )}
        </form.Field>
      </div>

      <div className="mb-3">
        <label className={`${labelClass} after:text-destructive after:ml-0.5 after:content-['*']`}>
          City
        </label>
        <form.Field
          name={`${prefix}.city`}
          validators={{ onBlur: addressSchema.shape.city, onSubmit: addressSchema.shape.city }}
        >
          {(field) => (
            <>
              <Input
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-describedby={`${prefix}-city-error`}
                aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
              />
              <FieldError
                id={`${prefix}-city-error`}
                errors={field.state.meta.errors}
                isTouched={field.state.meta.isTouched}
                isSubmitted={form.state.isSubmitted}
              />
            </>
          )}
        </form.Field>
      </div>

      <div className="mb-3">
        <label className={`${labelClass} after:text-destructive after:ml-0.5 after:content-['*']`}>
          Postcode
        </label>
        <form.Field
          name={`${prefix}.postcode`}
          validators={{
            onBlur: addressSchema.shape.postcode,
            onSubmit: addressSchema.shape.postcode,
          }}
        >
          {(field) => (
            <>
              <Input
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-describedby={`${prefix}-postcode-error`}
                aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
              />
              <FieldError
                id={`${prefix}-postcode-error`}
                errors={field.state.meta.errors}
                isTouched={field.state.meta.isTouched}
                isSubmitted={form.state.isSubmitted}
              />
            </>
          )}
        </form.Field>
      </div>

      <div className="mb-4">
        <label className={labelClass}>Phone number</label>
        <form.Field name={`${prefix}.phoneNumber`}>
          {(field) => (
            <Input
              value={field.state.value ?? ""}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </div>
    </>
  );

  return (
    <CheckoutLayout>
      <div className="flex-1 pt-4 pb-5 lg:pr-20">
        <Steps activeStep="address" />
        <form
          ref={formRef}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void submitForm(form, formRef.current);
          }}
        >
          <div className="mb-4 text-2xl font-bold">Address</div>

          {!customer && (
            <div className="mb-4">
              <label
                className={`${labelClass} after:text-destructive after:ml-0.5 after:content-['*']`}
              >
                Email
              </label>
              <form.Field name="email">
                {(field) => (
                  <>
                    <Input
                      type="email"
                      required
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
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
          )}

          <div className="mb-4">
            <div className="mb-4 text-xl font-semibold">Billing address</div>
            {renderAddressFields("billingAddress")}
          </div>

          <form.Field name="useDifferentShipping">
            {(field) => (
              <div className="mb-4 flex items-center gap-2">
                <Checkbox
                  id="differentShipping"
                  checked={field.state.value ?? false}
                  onCheckedChange={(checked) => {
                    const next = checked === true;
                    field.handleChange(next);
                    if (next) {
                      const billing = form.getFieldValue("billingAddress");
                      const shipping = form.getFieldValue("shippingAddress");
                      if (!shipping?.firstName) {
                        form.setFieldValue("shippingAddress", { ...billing });
                      }
                    }
                  }}
                />
                <label className="text-sm" htmlFor="differentShipping">
                  Use different address for shipping?
                </label>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.useDifferentShipping}>
            {(useDifferentShipping) =>
              useDifferentShipping ? (
                <div className="mb-4">
                  <div className="mb-4 text-xl font-semibold">Shipping address</div>
                  {renderAddressFields("shippingAddress")}
                </div>
              ) : null
            }
          </form.Subscribe>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
                  <IconChevronLeft stroke={2} />
                  Back to store
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Next
                  <IconChevronRight stroke={2} />
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </div>
    </CheckoutLayout>
  );
};

export default AddressPage;
