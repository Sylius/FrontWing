import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "~/components/LocalizedLink";
import Default from "~/layouts/Default";

export default function RegisterThankYouPage() {
    const { t } = useTranslation("account");
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Default>
            <div className="container my-auto">
                <div className="row justify-content-center my-5">
                    <div className="col-12 col-md-8 col-lg-6 text-center">
                        <h1 className="h2 mb-3">{t("auth.thankYou.title")}</h1>
                        <p className="lead mb-4">
                            {t("auth.thankYou.subtitle")}
                        </p>
                        <p className="mb-5">
                            {t("auth.thankYou.instructions")}
                        </p>
                        <LocalizedLink to="/login" className="btn btn-primary">
                            {t("auth.thankYou.goToLogin")}
                        </LocalizedLink>
                    </div>
                </div>
            </div>
        </Default>
    );
}
