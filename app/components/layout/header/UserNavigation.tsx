import { Link } from "react-router";
import { IconUser } from "@tabler/icons-react";
import { useCustomer } from "~/context/CustomerContext";

export default function UserNavigation() {
    const { customer, clearCustomer } = useCustomer();

    const handleLogout = () => {
        clearCustomer();
    };

    return (
        <>
            {customer ? (
                <div className="col-auto">
                    <div className="d-lg-none">
                        <button
                            className="btn btn-icon btn-transparent px-0"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <IconUser stroke={1.25} size={28} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <Link
                                    to="/account/dashboard"
                                    className="link-reset dropdown-item"
                                    id="mobile-my-account-button"
                                >
                                    My account
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/logout"
                                    className="link-reset dropdown-item"
                                    id="mobile-logout-button"
                                >
                                    Logout
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="d-none d-lg-flex gap-2 align-items-center ps-2">
                        <IconUser stroke={1.25} size={28} />
                        <span>Hello {customer.firstName}!</span>

                        <small className="text-black-50 px-1">|</small>
                        <Link
                            to="/account/dashboard"
                            className="link-reset"
                            id="my-account-button"
                        >
                            My account
                        </Link>

                        <small className="text-black-50 px-1">|</small>
                        <button
                            className="btn btn-transparent px-0"
                            id="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="col-auto">
                    <div className="d-lg-none">
                        <Link
                            to="/login"
                            className="btn btn-icon btn-transparent px-0"
                            aria-label="account button"
                        >
                            <IconUser stroke={1.25} size={28} />
                        </Link>
                    </div>

                    <div className="d-none d-lg-flex align-items-center gap-2 ps-2">
                        <IconUser stroke={1.25} size={28} />
                        <Link to="/login" className="link-reset" id="login-page-button">
                            Login
                        </Link>

                        <small className="text-black-50 px-1">|</small>
                        <Link
                            to="/register"
                            className="link-reset"
                            id="register-page-button"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
