import { useTranslation } from "react-i18next";
import { LocalizedLink } from "~/components/LocalizedLink";
import { IconUser } from "@tabler/icons-react";
import { useCustomer } from "~/context/CustomerContext";

export default function UserNavigation() {
    const { t } = useTranslation();
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
                                <LocalizedLink
                                    to="/account/dashboard"
                                    className="link-reset dropdown-item"
                                    id="mobile-my-account-button"
                                >
                                    {t("nav.account")}
                                </LocalizedLink>
                            </li>
                            <li>
                                <LocalizedLink
                                    to="/logout"
                                    className="link-reset dropdown-item"
                                    id="mobile-logout-button"
                                >
                                    {t("nav.logout")}
                                </LocalizedLink>
                            </li>
                        </ul>
                    </div>

                    <div className="d-none d-lg-flex gap-2 align-items-center ps-2">
                        <IconUser stroke={1.25} size={28} />
                        <span>{t("nav.greeting", { name: customer.firstName })}</span>

                        <small className="text-black-50 px-1">|</small>
                        <LocalizedLink
                            to="/account/dashboard"
                            className="link-reset"
                            id="my-account-button"
                        >
                            {t("nav.account")}
                        </LocalizedLink>

                        <small className="text-black-50 px-1">|</small>
                        <button
                            className="btn btn-transparent px-0"
                            id="logout-button"
                            onClick={handleLogout}
                        >
                            {t("nav.logout")}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="col-auto">
                    <div className="d-lg-none">
                        <LocalizedLink
                            to="/login"
                            className="btn btn-icon btn-transparent px-0"
                            aria-label={t("aria.accountButton")}
                        >
                            <IconUser stroke={1.25} size={28} />
                        </LocalizedLink>
                    </div>

                    <div className="d-none d-lg-flex align-items-center gap-2 ps-2">
                        <IconUser stroke={1.25} size={28} />
                        <LocalizedLink to="/login" className="link-reset" id="login-page-button">
                            {t("nav.login")}
                        </LocalizedLink>

                        <small className="text-black-50 px-1">|</small>
                        <LocalizedLink
                            to="/register"
                            className="link-reset"
                            id="register-page-button"
                        >
                            {t("nav.register")}
                        </LocalizedLink>
                    </div>
                </div>
            )}
        </>
    );
}
