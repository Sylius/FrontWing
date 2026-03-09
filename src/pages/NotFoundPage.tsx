import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
import Default from "../layouts/Default";

const NotFoundPage: React.FC = () => (
  <Default>
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-muted-foreground text-9xl font-bold">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Button nativeButton={false} render={<Link to="/" />}>
        Back to homepage
      </Button>
    </div>
  </Default>
);

export default NotFoundPage;
