import React from "react";
import Skeleton from "react-loading-skeleton";
import { Input } from "@/components/ui/input";
import { formError } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Structural interface to avoid the 12-parameter ReactFormExtendedApi generics.
// `any` on name/selector allows the actual TanStack Field (which narrows `name` to a union) to be
// assignable here via TypeScript's contravariance rules.
/* eslint-disable @typescript-eslint/no-explicit-any */
type FieldApi = {
  state: { value: any; meta: { errors: unknown[] } };
  handleChange: (v: any) => void;
  handleBlur: () => void;
};
export type AnyFormApi = {
  Field: (props: {
    name: any;
    children: (field: FieldApi) => React.ReactNode;
    [key: string]: any;
  }) => React.ReactNode;
  Subscribe: (props: {
    selector?: (state: any) => any;
    children: (value: any) => React.ReactNode;
  }) => React.ReactNode;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

interface Country {
  code: string;
  name: string;
}

interface AddressFormProps {
  form: AnyFormApi;
  countries: Country[];
  loadingCountries: boolean;
  errors?: Record<string, string>;
  submitted?: boolean;
}

const labelClass = "block text-sm font-medium mb-1";

const AddressForm: React.FC<AddressFormProps> = ({ form, countries, loadingCountries }) => (
  <div className="-mx-3 flex flex-wrap">
    <div className="mb-4 w-full px-3 md:w-1/2">
      <label className={labelClass}>First name *</label>
      <form.Field name="firstName">
        {(field) => (
          <>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
              aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
            />
            {(field.state.meta.errors?.length ?? 0) > 0 && (
              <p className="text-destructive mt-1 text-sm">
                {formError(field.state.meta.errors?.[0])}
              </p>
            )}
          </>
        )}
      </form.Field>
    </div>
    <div className="mb-4 w-full px-3 md:w-1/2">
      <label className={labelClass}>Last name *</label>
      <form.Field name="lastName">
        {(field) => (
          <>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
              aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
            />
            {(field.state.meta.errors?.length ?? 0) > 0 && (
              <p className="text-destructive mt-1 text-sm">
                {formError(field.state.meta.errors?.[0])}
              </p>
            )}
          </>
        )}
      </form.Field>
    </div>
    <div className="mb-4 w-full px-3">
      <label className={labelClass}>Company</label>
      <form.Field name="company">
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
      <label className={labelClass}>Street address *</label>
      <form.Field name="street">
        {(field) => (
          <>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
              aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
            />
            {(field.state.meta.errors?.length ?? 0) > 0 && (
              <p className="text-destructive mt-1 text-sm">
                {formError(field.state.meta.errors?.[0])}
              </p>
            )}
          </>
        )}
      </form.Field>
    </div>
    <div className="mb-4 w-full px-3">
      <label className={labelClass}>Country *</label>
      {loadingCountries ? (
        <Skeleton height={36} />
      ) : (
        <form.Field name="countryCode">
          {(field) => (
            <>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val ?? "")}
                required
              >
                <SelectTrigger>
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
              {(field.state.meta.errors?.length ?? 0) > 0 && (
                <p className="text-destructive mt-1 text-sm">
                  {formError(field.state.meta.errors?.[0])}
                </p>
              )}
            </>
          )}
        </form.Field>
      )}
    </div>
    <form.Subscribe selector={(state) => state.values.countryCode}>
      {(countryCode) =>
        countryCode ? (
          <div className="mb-4 w-full px-3">
            <label className={labelClass}>Province</label>
            <form.Field name="provinceName">
              {(field) => (
                <Input
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            </form.Field>
          </div>
        ) : null
      }
    </form.Subscribe>
    <div className="mb-4 w-full px-3 md:w-1/2">
      <label className={labelClass}>City *</label>
      <form.Field name="city">
        {(field) => (
          <>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
              aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
            />
            {(field.state.meta.errors?.length ?? 0) > 0 && (
              <p className="text-destructive mt-1 text-sm">
                {formError(field.state.meta.errors?.[0])}
              </p>
            )}
          </>
        )}
      </form.Field>
    </div>
    <div className="mb-4 w-full px-3 md:w-1/2">
      <label className={labelClass}>Postcode *</label>
      <form.Field name="postcode">
        {(field) => (
          <>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
              aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
            />
            {(field.state.meta.errors?.length ?? 0) > 0 && (
              <p className="text-destructive mt-1 text-sm">
                {formError(field.state.meta.errors?.[0])}
              </p>
            )}
          </>
        )}
      </form.Field>
    </div>
    <div className="mb-4 w-full px-3">
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
  </div>
);

export default AddressForm;
