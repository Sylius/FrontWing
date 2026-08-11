import { useTranslation } from "react-i18next";
import { LocalizedLink } from "~/components/LocalizedLink";
import { IconLockOpen } from "@tabler/icons-react";

export default function AuthLeftPanel() {
    const { t } = useTranslation("account");
    return (
        <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-0 order-lg-0">
            <div className="d-flex flex-column justify-content-center align-items-center bg-light rounded-4 h-100 p-3">
                <div className="text-center">
                    <div className="mb-3">
                        <IconLockOpen stroke={2} size={144} />
                    </div>
                    <h2>{t("auth.panel.noAccount")}</h2>
                    <LocalizedLink
                        to="/register"
                        className="btn btn-link"
                        id="register-here-button"
                    >
                        {t("auth.panel.registerHere")}
                    </LocalizedLink>
                </div>
            </div>
        </div>
    );
}
