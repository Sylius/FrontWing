import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "./../components/layout/Footer";
import Header from "./../components/layout/Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
