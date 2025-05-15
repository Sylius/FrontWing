export interface Address {
    firstName?: string;
    lastName?: string;
    fullName?: string | null;
    phoneNumber?: string | null;
    company?: string | null;
    countryCode?: string;
    provinceCode?: string | null;
    provinceName?: string | null;
    street?: string;
    city?: string;
    postcode?: string;
    createdAt?: string;
    updatedAt?: string | null;
    id?: number;
    customer?: string | null;
}
