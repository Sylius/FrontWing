import React from "react";
import { IconLockOpen } from "@tabler/icons-react";

const AuthLeftPanel: React.FC = () => {
    return (
        <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-0 order-lg-0">
            <div className="d-flex flex-column justify-content-center align-items-center bg-light rounded-4 h-100 p-3">
                <div className="text-center">
                    <div className="mb-3">
                        <IconLockOpen stroke={2} size={144} color={"#e8eaed"} />
                    </div>
                    <h2>Don't have an account?</h2>
                    <a
                        className="btn btn-link"
                        id="register-here-button"
                        href="/register"
                    >
                        Register here
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AuthLeftPanel;
