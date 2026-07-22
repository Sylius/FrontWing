import { useEffect } from "react";
import { Link } from "react-router";
import Default from "~/layouts/Default";

export default function RegisterThankYouPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Default>
            <div className="container my-auto">
                <div className="row justify-content-center my-5">
                    <div className="col-12 col-md-8 col-lg-6 text-center">
                        <h1 className="h2 mb-3">Thank you for your registration!</h1>
                        <p className="lead mb-4">
                            We've sent a verification email to your inbox.
                        </p>
                        <p className="mb-5">
                            Please check your email and click the verification link to activate your account. If you don’t receive it within a few minutes, please check your spam folder.
                        </p>
                        <Link to="/login" className="btn btn-primary">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        </Default>
    );
}
