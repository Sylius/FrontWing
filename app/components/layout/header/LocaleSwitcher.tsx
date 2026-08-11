import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router";
import { IconCheck, IconWorld } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useChannel } from "~/context/ChannelContext";
import { createLocaleMapper } from "~/utils/locale";

export const LocaleSwitcher = () => {
    const { t } = useTranslation();
    const { locales } = useChannel();
    const { lang } = useParams();
    const { pathname, search, hash } = useLocation();

    const mapper = useMemo(() => createLocaleMapper(locales), [locales]);
    const activeSegment = lang ?? mapper.urlSegments[0];

    const displayNames = useMemo(
        () => new Intl.DisplayNames([activeSegment], { type: "language" }),
        [activeSegment],
    );

    const hrefFor = (segment: string) => {
        const rest = lang
            ? pathname.slice(1 + lang.length)
            : pathname === "/"
              ? ""
              : pathname;
        return `/${segment}${rest}${search}${hash}`;
    };

    const languageName = (segment: string) => {
        const name = displayNames.of(segment) ?? segment;
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    return (
        <div className="dropdown">
            <button
                className="btn btn-icon btn-transparent px-0"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label={t("localeSwitcher.ariaLabel")}
            >
                <IconWorld stroke={1.25} size={28} />
                <span className="text-uppercase small fw-medium">{activeSegment}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
                <li>
                    <h6 className="dropdown-header">{t("localeSwitcher.language")}</h6>
                </li>
                {mapper.urlSegments.map((segment) => {
                    const isActive = segment === activeSegment;
                    return (
                        <li key={segment}>
                            <Link
                                to={hrefFor(segment)}
                                className="link-reset dropdown-item d-flex align-items-center justify-content-between gap-3"
                                aria-current={isActive ? "true" : undefined}
                            >
                                <span>{languageName(segment)}</span>
                                {isActive && <IconCheck stroke={2} size={16} />}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
