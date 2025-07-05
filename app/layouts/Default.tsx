import Header from './../components/layout/Header';
import Footer from './../components/layout/Footer';
import Navbar from "../components/layout/Navbar";
import React from 'react';
import { useOutletContext } from '@remix-run/react';
import type { Taxon } from '~/types/Taxon';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { taxonTree } = useOutletContext<{ taxonTree: Taxon[] }>();

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <Navbar taxonTree={taxonTree} />
            {children}
            <Footer />
        </div>
    );
};

export default Layout;
