import React from 'react';
import { Link } from 'react-router';
import { IconChevronDown } from '@tabler/icons-react';
import type { Taxon } from '~/types/Taxon';
import { getChildren } from '~/utils/taxon';

interface NavbarProps {
    taxonTree: Taxon[];
}

const Navbar: React.FC<NavbarProps> = ({ taxonTree = [] }) => {
    const parents = taxonTree.filter(t => t.level === 1);

    return (
        <div className="w-100 border-bottom">
            <nav
                className="navbar offcanvas-lg offcanvas-start offcanvas-wide p-0"
                id="navbarNav"
            >
                <div className="offcanvas-header w-100">
                    <h5 className="offcanvas-title">Categories</h5>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        data-bs-target="#navbarNav"
                        aria-label="Close"
                    ></button>
                </div>

                <div className="offcanvas-body justify-content-lg-center w-100 py-0">
                    <div className="navbar-nav my-2 flex-column flex-lg-row gap-lg-4">
                        {parents.map((taxon) => {
                            const children = getChildren(taxonTree, taxon.code);
                            const hasChildren = children.length > 0;

                            return hasChildren ? (
                                <div
                                    key={taxon.code}
                                    className="nav-item dropdown position-relative"
                                >
                                    <a
                                        href="#"
                                        className="nav-link d-flex align-items-center gap-1"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {taxon.name}
                                        <IconChevronDown stroke={2} size={20} />
                                    </a>
                                    <div className="dropdown-menu position-absolute border dropdown-custom">
                                        {children.map((child) => (
                                            <Link
                                                key={child.code}
                                                className="nav-link nav-link-padding"
                                                to={`/${taxon.code}/${child.code}`}
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={taxon.code}
                                    className="nav-link"
                                    to={`/${taxon.slug}`}
                                >
                                    {taxon.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
