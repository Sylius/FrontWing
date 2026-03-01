import { Button } from "@/components/ui/button";
import { IconUser } from '@tabler/icons-react';
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomer } from "../../../context/CustomerContext";


const UserNavigation: React.FC = () => {
    const { customer , clearCustomer } = useCustomer();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        clearCustomer();
    }

    return (
        <>
            {customer ? (
                <div className="flex-none">
                    <div className="lg:hidden relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="px-0"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <IconUser stroke={1.25} size={28} />
                        </Button>
                        {dropdownOpen && (
                            <ul className="absolute right-0 top-full z-50 bg-white border rounded shadow-md min-w-[160px] py-1">
                                <li>
                                    <a href="/en_US/account/dashboard" className="block px-4 py-2 text-foreground hover:bg-muted"
                                       id="mobile-my-account-button">
                                        My account
                                    </a>
                                </li>
                                <li>
                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 h-auto justify-start rounded-none"
                                        id="mobile-logout-button"
                                    >
                                        Logout
                                    </Button>
                                </li>
                            </ul>
                        )}
                    </div>

                    <div className="hidden lg:flex gap-2 items-center pl-2">
                        <IconUser stroke={1.25} size={28} />
                        <span>
                            Hello {customer.firstName}!
                        </span>

                        <small className="text-muted-foreground px-1">|</small>
                        <Link to="/account/dashboard" className="link-reset" id="my-account-button">
                            My account
                        </Link>

                        <small className="text-muted-foreground px-1">|</small>
                        <Button variant="link" className="text-foreground link-reset text-md font-normal hover:text-primary hover:no-underline px-0" id="logout-button" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-none">
                    <div className="flex items-center">
                        <div className="lg:hidden">
                            <a href="/login" className="btn-icon px-0"
                               aria-label="account button">
                                <IconUser stroke={1.25} size={28} />
                            </a>
                        </div>

                        <div className="hidden lg:flex items-center gap-2 pl-2">
                            <IconUser stroke={1.25} size={28} />

                            <Link to="/login" className="link-reset" id="login-page-button">
                                Login
                            </Link>

                            <small className="text-muted-foreground px-1">|</small>
                            <a href="/en_US/register" className="link-reset" id="register-page-button">
                                Register
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default UserNavigation;
