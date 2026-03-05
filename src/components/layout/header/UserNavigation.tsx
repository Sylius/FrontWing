import { Button } from "@/components/ui/button";
import { IconUser } from "@tabler/icons-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomer } from "../../../context/CustomerContext";

const UserNavigation: React.FC = () => {
  const { customer, clearCustomer } = useCustomer();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    clearCustomer();
  };

  return (
    <>
      {customer ? (
        <div className="flex-none">
          <div className="relative lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="px-0"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <IconUser stroke={1.25} size={28} />
            </Button>
            {dropdownOpen && (
              <ul className="absolute top-full right-0 z-50 min-w-[160px] rounded border bg-white py-1 shadow-md">
                <li>
                  <a
                    href="/en_US/account/dashboard"
                    className="text-foreground hover:bg-muted block px-4 py-2"
                    id="mobile-my-account-button"
                  >
                    My account
                  </a>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="block h-auto w-full justify-start rounded-none px-4 py-2 text-left"
                    id="mobile-logout-button"
                  >
                    Logout
                  </Button>
                </li>
              </ul>
            )}
          </div>

          <div className="hidden items-center gap-2 pl-2 lg:flex">
            <IconUser stroke={1.25} size={28} />
            <span>Hello {customer.firstName}!</span>

            <small className="text-muted-foreground px-1">|</small>
            <Link to="/account/dashboard" className="link-reset" id="my-account-button">
              My account
            </Link>

            <small className="text-muted-foreground px-1">|</small>
            <Button
              variant="link"
              className="text-foreground link-reset text-md hover:text-primary px-0 font-normal hover:no-underline"
              id="logout-button"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-none">
          <div className="flex items-center">
            <div className="lg:hidden">
              <a href="/login" className="btn-icon px-0" aria-label="account button">
                <IconUser stroke={1.25} size={28} />
              </a>
            </div>

            <div className="hidden items-center gap-2 pl-2 lg:flex">
              <IconUser stroke={1.25} size={28} />

              <Link to="/login" className="link-reset" id="login-page-button">
                Login
              </Link>

              <small className="text-muted-foreground px-1">|</small>
              <a href="/register" className="link-reset" id="register-page-button">
                Register
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserNavigation;
