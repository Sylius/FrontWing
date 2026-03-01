import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { IconChevronDown, IconMenu2 } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Taxon, TaxonChild } from '../../types/Taxon';

const Navbar: React.FC = () => {
  const [taxons, setTaxons] = useState<Taxon[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<number, TaxonChild[]>>(
    {}
  );
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    const fetchTaxons = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/taxons`
        );
        const json = await res.json();
        const data: Taxon[] = json['hydra:member'] || [];

        setTaxons(data);

        const childrenResults = await Promise.all(
          data.map(async (taxon) => {
            const childObjects: TaxonChild[] = await Promise.all(
              taxon.children.map(async (childUrl) => {
                const res = await fetch(
                  `${import.meta.env.VITE_REACT_APP_API_URL}${childUrl}`
                );
                return await res.json();
              })
            );
            return { taxonId: taxon.id, children: childObjects };
          })
        );

        const map: Record<number, TaxonChild[]> = {};
        childrenResults.forEach(({ taxonId, children }) => {
          map[taxonId] = children;
        });

        setChildrenMap(map);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    fetchTaxons();
  }, []);

  return (
    <div className="w-full border-b">
      {/* Desktop navbar */}
      <nav className="hidden lg:flex justify-center py-0">
        <NavigationMenu className="my-1">
          <NavigationMenuList>
            {taxons.map((taxon) => {
              const hasChildren = childrenMap[taxon.id]?.length > 0;
              return (
                <NavigationMenuItem key={taxon.id}>
                  {hasChildren ? (
                    <>
                      <NavigationMenuTrigger 
                        className="data-popup-open:bg-transparent data-popup-open:text-primary data-popup-open:hover:bg-transparent data-popup-open:hover:text-primary active:text-primary hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary"
                      >
                        {taxon.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-50 p-2 gap-0.5">
                          {childrenMap[taxon.id].map((child) => (
                            <li key={child.id}>
                              <NavigationMenuLink
                                render={<Link to={`/${taxon.code}/${child.code}`} className="hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary" />}
                              >
                                {child.name}
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      render={<Link to={`/${taxon.slug}`} className="hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary" />}
                    >
                      {taxon.name}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      {/* Mobile navbar trigger */}
      <div className="lg:hidden flex items-center px-4 py-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Toggle navigation" />}>
            <IconMenu2 stroke={1.25} size={28} />
          </SheetTrigger>
          <SheetContent side="left" className="w-70 p-0">
            <div className="p-4 border-b">
              <h5 className="font-semibold text-lg">Taxons</h5>
            </div>
            <div className="flex flex-col py-2">
              {taxons.map((taxon) => {
                const hasChildren = childrenMap[taxon.id]?.length > 0;
                return hasChildren ? (
                  <div key={taxon.id}>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 py-2 px-3 w-full justify-start"
                      onClick={() =>
                        setOpenDropdown(openDropdown === taxon.id ? null : taxon.id)
                      }
                    >
                      {taxon.name}
                      <IconChevronDown
                        stroke={2}
                        size={20}
                        className={`ml-auto transition-transform duration-200 ${
                          openDropdown === taxon.id ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                    {openDropdown === taxon.id && (
                      <div className="pl-4">
                        {childrenMap[taxon.id].map((child) => (
                          <Link
                            key={child.id}
                            className="block py-2 px-6 text-foreground hover:text-primary hover:bg-muted/50"
                            to={`/${taxon.code}/${child.code}`}
                            onClick={() => setIsOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={taxon.id}
                    className="block py-2 px-3 text-foreground hover:text-primary"
                    to={`/${taxon.slug}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {taxon.name}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Navbar;
