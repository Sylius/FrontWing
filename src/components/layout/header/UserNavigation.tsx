import { IconUser } from '@tabler/icons-react';
import React from "react";
import { Link } from "react-router-dom";
import { useCustomer } from "../../../context/CustomerContext";


const UserNavigation: React.FC = () => {
    const { customer , clearCustomer } = useCustomer();

    const handleLogout = () => {
        clearCustomer();
    }

    return (
        <>
            {customer ? (
                <div className="col-auto">
                    <div className="d-lg-none">
                        <button className="btn btn-icon btn-transparent px-0" data-bs-toggle="dropdown"
                                aria-expanded="false">
                            <IconUser stroke={1.25} size={28} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <a href="/en_US/account/dashboard" className="link-reset dropdown-item"
                                   id="mobile-my-account-button">
                                    My account
                                </a>
                            </li>
                            <li>
                                <a href="/en_US/logout" className="link-reset dropdown-item" id="mobile-logout-button">
                                    Logout
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="d-none d-lg-flex gap-2 align-items-center ps-2">
                        <IconUser stroke={1.25} size={28} />
                        <span>
                            Hello {customer.firstName}!
                        </span>

                        <small className="text-black-50 px-1">|</small>
                        <Link to="/account/dashboard" className="link-reset" id="my-account-button">
                            My account
                        </Link>

                        <small className="text-black-50 px-1">|</small>
                        <button className="btn btn-transparent px-0" id="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="col-auto">
                    <div className="d-flex align-items-center">
                        <div className="d-lg-none">
                            <a href="/login" className="btn btn-icon btn-transparent px-0"
                               aria-label="account button">
                                <IconUser stroke={1.25} size={28} />
                            </a>
                        </div>

                        <div className="d-none d-lg-flex align-items-center gap-2 ps-2">
                            <IconUser stroke={1.25} size={28} />

                            <Link to="/login" className="link-reset" id="login-page-button">
                                Login
                            </Link>

                            <small className="text-black-50 px-1">|</small>
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
