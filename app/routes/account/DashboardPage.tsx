import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import Default from "~/layouts/Default";
import AccountLayout from "~/layouts/Account";
import { useCustomer } from "~/context/CustomerContext";
import { useFlashMessages } from "~/context/FlashMessagesContext";
import { IconPencil, IconLock, IconCheck } from "@tabler/icons-react";
import Skeleton from "react-loading-skeleton";
import { sendVerificationEmail, verifyToken } from "~/services/customerVerification";

export default function DashboardPage() {
    const { customer, refetchCustomer } = useCustomer();
    const { addMessage } = useFlashMessages();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [isVerifying, setIsVerifying] = useState(false);
    const verificationAttempted = useRef(false);

    const handleVerifyClick = async () => {
        if (!customer?.email) {
            addMessage("error", "Customer email not found.");
            return;
        }

        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
            addMessage("error", "Authentication token not found. Please log in again.");
            return;
        }

        setIsVerifying(true);
        const { success, message } = await sendVerificationEmail(customer.email, jwtToken);

        if (success) {
            addMessage("success", message || "Verification email sent! Please check your inbox.");
        } else {
            addMessage("error", message || "Failed to send verification email.");
        }

        setIsVerifying(false);
    };

    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");
        const jwtToken = localStorage.getItem("jwtToken");

        if (!tokenFromUrl || !jwtToken || verificationAttempted.current) return;
        verificationAttempted.current = true;

        const verify = async () => {
            const { success, message } = await verifyToken(tokenFromUrl, jwtToken);

            if (success) {
                addMessage("success", message || "Your email has been successfully verified.");
                await refetchCustomer();
            } else {
                addMessage("error", message || "Verification failed.");
            }

            navigate("/account/dashboard", { replace: true });
        };

        verify();
    }, [searchParams, addMessage, refetchCustomer, navigate]);

    return (
        <Default>
            <AccountLayout>
                <div className="col-12 col-md-9">
                    <div className="mb-4">
                        <h1>My account</h1>
                        Manage your personal information and preferences
                    </div>

                    <div className="card border-0 bg-body-tertiary">
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-12 col-sm-auto mb-2 order-sm-1">
                                    {!customer?.user ? (
                                        <Skeleton width={80} height={26} borderRadius={20} />
                                    ) : customer.user.verified ? (
                                        <span className="badge text-bg-success">Verified</span>
                                    ) : (
                                        <span className="badge text-bg-danger">Not verified</span>
                                    )}
                                </div>

                                <div className="col-12 col-sm">
                                    <strong>{customer?.fullName || <Skeleton width={120} />}</strong>
                                    <div>{customer?.email || <Skeleton width={180} />}</div>
                                </div>
                            </div>

                            <div className="d-flex flex-column align-items-center flex-sm-row gap-2">
                                {!customer?.user ? (
                                    <>
                                        <Skeleton width={100} height={36} />
                                        <Skeleton width={140} height={36} />
                                        <Skeleton width={120} height={36} />
                                    </>
                                ) : (
                                    <>
                                        <Link to="/account/profile/edit" className="btn btn-sm btn-icon btn-outline-gray">
                                            <IconPencil stroke={2} size={16} />
                                            Edit
                                        </Link>

                                        <Link to="/account/change-password" className="btn btn-sm btn-icon btn-outline-gray">
                                            <IconLock stroke={2} size={16} />
                                            Change password
                                        </Link>

                                        {!customer.user.verified && (
                                            <button
                                                className="btn btn-sm btn-icon btn-outline-gray text-primary"
                                                type="button"
                                                onClick={handleVerifyClick}
                                                disabled={isVerifying}
                                            >
                                                {isVerifying ? (
                                                    <>
                            <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                            ></span>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconCheck stroke={2} size={16} />
                                                        Verify
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AccountLayout>
        </Default>
    );
}
