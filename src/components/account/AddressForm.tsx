import React from "react";
import Skeleton from "react-loading-skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddressFormProps {
    formData: {
        firstName: string;
        lastName: string;
        company: string;
        street: string;
        countryCode: string;
        provinceName: string;
        city: string;
        postcode: string;
        phoneNumber: string;
    };
    countries: { code: string; name: string }[];
    loadingCountries: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCountryChange: (value: string) => void;
    errors?: Record<string, string>;
    submitted?: boolean;
}

const labelClass = "block text-sm font-medium mb-1";

const AddressForm: React.FC<AddressFormProps> = ({ formData, countries, loadingCountries, onChange, onCountryChange, errors, submitted }) => (
    <div className="flex flex-wrap -mx-3">
        <div className="w-full md:w-1/2 px-3 mb-4">
            <label className={labelClass}>First name *</label>
            <Input
                name="firstName"
                value={formData.firstName}
                onChange={onChange}
                required
                aria-invalid={submitted && !!errors?.firstName || undefined}
            />
            {submitted && errors?.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
            )}
        </div>
        <div className="w-full md:w-1/2 px-3 mb-4">
            <label className={labelClass}>Last name *</label>
            <Input
                name="lastName"
                value={formData.lastName}
                onChange={onChange}
                required
                aria-invalid={submitted && !!errors?.lastName || undefined}
            />
            {submitted && errors?.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
            )}
        </div>
        <div className="w-full px-3 mb-4">
            <label className={labelClass}>Company</label>
            <Input name="company" value={formData.company} onChange={onChange} />
        </div>
        <div className="w-full px-3 mb-4">
            <label className={labelClass}>Street address *</label>
            <Input
                name="street"
                value={formData.street}
                onChange={onChange}
                required
                aria-invalid={submitted && !!errors?.street || undefined}
            />
            {submitted && errors?.street && (
                <p className="text-sm text-destructive mt-1">{errors.street}</p>
            )}
        </div>
        <div className="w-full px-3 mb-4">
            <label className={labelClass}>Country *</label>
            {loadingCountries ? (
                <Skeleton height={36} />
            ) : (
                <Select
                    value={formData.countryCode}
                    onValueChange={(v) => v && onCountryChange(v)}
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
            )}
            {submitted && errors?.countryCode && (
                <p className="text-sm text-destructive mt-1">{errors.countryCode}</p>
            )}
        </div>
        {formData.countryCode && (
            <div className="w-full px-3 mb-4">
                <label className={labelClass}>Province</label>
                <Input
                    name="provinceName"
                    value={formData.provinceName}
                    onChange={onChange}
                />
            </div>
        )}
        <div className="w-full md:w-1/2 px-3 mb-4">
            <label className={labelClass}>City *</label>
            <Input
                name="city"
                value={formData.city}
                onChange={onChange}
                required
                aria-invalid={submitted && !!errors?.city || undefined}
            />
            {submitted && errors?.city && (
                <p className="text-sm text-destructive mt-1">{errors.city}</p>
            )}
        </div>
        <div className="w-full md:w-1/2 px-3 mb-4">
            <label className={labelClass}>Postcode *</label>
            <Input
                name="postcode"
                value={formData.postcode}
                onChange={onChange}
                required
                aria-invalid={submitted && !!errors?.postcode || undefined}
            />
            {submitted && errors?.postcode && (
                <p className="text-sm text-destructive mt-1">{errors.postcode}</p>
            )}
        </div>
        <div className="w-full px-3 mb-4">
            <label className={labelClass}>Phone number</label>
            <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={onChange}
            />
        </div>
    </div>
);

export default AddressForm;
