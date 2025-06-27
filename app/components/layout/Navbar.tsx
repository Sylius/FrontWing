import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Taxon } from '~/types/Taxon';
import { IconChevronDown } from '@tabler/icons-react';

const Navbar: React.FC = () => {
  const [taxons, setTaxons] = useState<Taxon[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, Taxon[]>>({});

  useEffect(() => {
    const fetchTaxons = async () => {
      try {
        const API_URL = window.ENV?.API_URL;
        const res = await fetch(`${API_URL}/api/v2/shop/taxons`);
        const json = await res.json();
        const data: Taxon[] = json['hydra:member'] || [];
        setTaxons(data);

        const childrenResults = await Promise.all(
            data.map(async (taxon) => {
              const branchRes = await fetch(`${API_URL}/api/v2/shop/taxon-tree/${taxon.code}/branch`);
              const branchJson = await branchRes.json();
              const children: Taxon[] =
                  branchJson['hydra:member']?.filter(
                      (child: Taxon) => child.parent?.endsWith(`/taxons/${taxon.code}`)
                  ) || [];
              return { code: taxon.code, children };
            })
        );

        const map: Record<string, Taxon[]> = {};
        childrenResults.forEach(({ code, children }) => {
          map[code] = children;
        });

        setChildrenMap(map);
      } catch (err) {
        console.error('Błąd ładowania kategorii:', err);
      }
    };

    fetchTaxons();
  }, []);

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
              {taxons.map((taxon) => {
                const children = childrenMap[taxon.code] || [];
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
                    <Link key={taxon.code} className="nav-link" to={`/${taxon.slug}`}>
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
