import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Steps from '../../components/checkout/Steps';
import { useCustomer } from '../../context/CustomerContext';
import { useOrder } from '../../context/OrderContext';
import CheckoutLayout from '../../layouts/Checkout';
import { AddressInterface } from '../../types/Order';

interface Country {
    code: string;
    name: string;
}

const emptyAddress: AddressInterface = {
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    countryCode: '',
    city: '',
    postcode: '',
    phoneNumber: '',
};

const labelClass = "block text-sm font-medium mb-1";

const AddressPage: React.FC = () => {
    const { customer } = useCustomer();
    const { order, fetchOrder } = useOrder();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [billingAddress, setBillingAddress] = useState<AddressInterface>(emptyAddress);
    const [shippingAddress, setShippingAddress] = useState<AddressInterface>(emptyAddress);
    const [useDifferentShipping, setUseDifferentShipping] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addresses, setAddresses] = useState<AddressInterface[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});
    const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});
    const [emailError, setEmailError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const isInitialized = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('jwtToken');

            try {
                const [addressesRes, countriesRes] = await Promise.all([
                    token
                        ? fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        : Promise.resolve({ json: () => ({ 'hydra:member': [] }) }),
                    fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/countries`),
                ]);

                const addressData = await addressesRes.json();
                const countryData = await countriesRes.json();

                const addressItems = addressData['hydra:member'] as AddressInterface[];
                const countryItems = countryData['hydra:member'] as Country[];

                setAddresses(addressItems);
                setCountries(countryItems);

                if (!isInitialized.current) {
                    if (order?.billingAddress) {
                        setBillingAddress(order.billingAddress);
                    } else if (token && customer) {
                        const defaultAddressId =
                            typeof customer.defaultAddress === 'string'
                                ? customer.defaultAddress.split('/').pop()
                                : customer.defaultAddress?.['@id']?.split('/').pop();

                        const defaultAddress = addressItems.find(addr => String(addr.id) === defaultAddressId);
                        if (defaultAddress) {
                            setBillingAddress({ ...defaultAddress });
                        }
                    }

                    if (order?.shippingAddress) {
                        setUseDifferentShipping(true);
                        setShippingAddress(order.shippingAddress);
                    }

                    isInitialized.current = true;
                }
            } catch (error) {
                console.error('Error loading addresses or countries', error);
            }
        };

        fetchData();
    }, [customer, order]);

    const handleChange =
        (setter: React.Dispatch<React.SetStateAction<AddressInterface>>) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const { name, value } = e.target;
                setter(prev => ({ ...prev, [name]: value }));
            };

    const handleAddressSelect =
        (setter: React.Dispatch<React.SetStateAction<AddressInterface>>) =>
            (selectedId: string) => {
                const selected = addresses.find(addr => String(addr.id) === selectedId);
                if (selected) {
                    setter({ ...selected });
                }
            };

    const handleCountryChange =
        (setter: React.Dispatch<React.SetStateAction<AddressInterface>>) =>
            (value: string) => {
                setter(prev => ({ ...prev, countryCode: value }));
            };

    const validateAddress = (address: AddressInterface): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!address.firstName.trim()) e.firstName = "Required";
        if (!address.lastName.trim()) e.lastName = "Required";
        if (!address.street.trim()) e.street = "Required";
        if (!address.city.trim()) e.city = "Required";
        if (!address.postcode.trim()) e.postcode = "Required";
        if (!address.countryCode.trim()) e.countryCode = "Required";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const bErrors = validateAddress(billingAddress);
        const sErrors = useDifferentShipping ? validateAddress(shippingAddress) : {};
        const eError = !customer && !email.trim() ? "Required" : "";

        setBillingErrors(bErrors);
        setShippingErrors(sErrors);
        setEmailError(eError);

        if (Object.keys(bErrors).length > 0 || Object.keys(sErrors).length > 0 || eError) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${localStorage.getItem('orderToken')}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: customer?.email ?? email,
                        billingAddress,
                        shippingAddress: useDifferentShipping ? shippingAddress : billingAddress,
                        couponCode: null,
                    }),
                }
            );

            if (!response.ok) throw new Error('Failed to submit order');

            await fetchOrder();
            navigate('/checkout/select-shipping');
        } catch (err) {
            console.error('Order submission error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderAddressForm = (
        address: AddressInterface,
        setAddress: React.Dispatch<React.SetStateAction<AddressInterface>>,
        errors: Record<string, string>
    ) => (
        <>
            {addresses.length > 0 && (
                <div className="mb-3">
                    <label className={labelClass}>Select address from my book</label>
                    <Select onValueChange={(v) => { if (typeof v === 'string') handleAddressSelect(setAddress)(v) }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select address from my book" />
                        </SelectTrigger>
                        <SelectContent>
                            {addresses.map(addr => {
                                const countryName = countries.find(c => c.code === addr.countryCode)?.name || addr.countryCode;
                                return (
                                    <SelectItem key={addr.id} value={String(addr.id)}>
                                        {addr.firstName} {addr.lastName}, {addr.street}, {addr.city} {addr.postcode}, {countryName}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="flex flex-wrap -mx-3">
                <div className="w-full md:w-1/2 px-3 mb-3">
                    <label className={`${labelClass} after:content-['*'] after:ml-0.5 after:text-destructive`}>First name</label>
                    <Input name="firstName" required value={address.firstName} onChange={handleChange(setAddress)} aria-invalid={submitted && !!errors.firstName || undefined} />
                    {submitted && errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-3">
                    <label className={`${labelClass} after:content-['*'] after:ml-0.5 after:text-destructive`}>Last name</label>
                    <Input name="lastName" required value={address.lastName} onChange={handleChange(setAddress)} aria-invalid={submitted && !!errors.lastName || undefined} />
                    {submitted && errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                </div>
            </div>

            <div className="mb-3">
                <label className={labelClass}>Company</label>
                <Input name="company" value={address.company} onChange={handleChange(setAddress)} />
            </div>

            <div className="mb-3">
                <label className={`${labelClass} after:content-['*'] after:ml-0.5 after:text-destructive`}>Street address</label>
                <Input name="street" required value={address.street} onChange={handleChange(setAddress)} aria-invalid={submitted && !!errors.street || undefined} />
                {submitted && errors.street && <p className="text-sm text-destructive mt-1">{errors.street}</p>}
            </div>

            <div className="mb-3">
                <label className={`${labelClass} after:content-['*'] after:ml-0.5 after:text-destructive`}>Country</label>
                <Select value={address.countryCode} onValueChange={(v) => v && handleCountryChange(setAddress)(v)} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                                {country.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {submitted && errors.countryCode && <p className="text-sm text-destructive mt-1">{errors.countryCode}</p>}
            </div>

            <div className="mb-3">
                <label className={`${labelClass} after:content-['*'] after:ml-0.5 after:text-destructive`}>City</label>
                <Input name="city" required value={address.city} onChange={handleChange(setAddress)} aria-invalid={submitted && !!errors.city || undefined} />
                {submitted && errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
            </div>

            <div className="mb-3">
                <label className={`${labelClass} after:content-['*'] after:ml-0.5 after:text-destructive`}>Postcode</label>
                <Input name="postcode" required value={address.postcode} onChange={handleChange(setAddress)} aria-invalid={submitted && !!errors.postcode || undefined} />
                {submitted && errors.postcode && <p className="text-sm text-destructive mt-1">{errors.postcode}</p>}
            </div>

            <div className="mb-4">
                <label className={labelClass}>Phone number</label>
                <Input name="phoneNumber" value={address.phoneNumber} onChange={handleChange(setAddress)} />
            </div>
        </>
    );

    return (
        <CheckoutLayout>
            <div className="flex-1 pt-4 pb-5 lg:pr-20">
                <Steps activeStep="address" />
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 text-2xl font-bold">Address</div>

                    {!customer && (
                        <div className="mb-4">
                            <label className={`${labelClass} after:content-['*'] after:ml-0.5 after:text-destructive`}>Email</label>
                            <Input
                                type="email"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-invalid={submitted && !!emailError || undefined}
                            />
                            {submitted && emailError && <p className="text-sm text-destructive mt-1">{emailError}</p>}
                        </div>
                    )}

                    <div className="mb-4">
                        <div className="text-xl font-semibold mb-4">Billing address</div>
                        {renderAddressForm(billingAddress, setBillingAddress, billingErrors)}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <Checkbox
                            id="differentShipping"
                            checked={useDifferentShipping}
                            onCheckedChange={(checked) => {
                                const next = checked === true;
                                setUseDifferentShipping(next);
                                if (next && !shippingAddress.firstName) {
                                    setShippingAddress({ ...billingAddress });
                                }
                            }}
                        />
                        <label className="text-sm" htmlFor="differentShipping">
                            Use different address for shipping?
                        </label>
                    </div>

                    {useDifferentShipping && (
                        <div className="mb-4">
                            <div className="text-xl font-semibold mb-4">Shipping address</div>
                            {renderAddressForm(shippingAddress, setShippingAddress, shippingErrors)}
                        </div>
                    )}

                    <div className="flex justify-between flex-col sm:flex-row gap-2">
                        <Button variant="outline" render={<Link to="/" />}>
                            <IconChevronLeft stroke={2} />
                            Back to store
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            Next
                            <IconChevronRight stroke={2} />
                        </Button>
                    </div>
                </form>
            </div>
        </CheckoutLayout>
    );
};

export default AddressPage;
