import React, { useEffect, useState, useRef } from "react";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import { useCustomer } from "../../context/CustomerContext";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import { IconPencil, IconLock, IconCheck } from "@tabler/icons-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { sendVerificationEmail, verifyToken } from "../../services/customerVerification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DashboardPage: React.FC = () => {
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
        const { success, message } = await sendVerificationEmail(customer.email, window.location.href, jwtToken);

        if (success) {
            addMessage("success", "Verification email sent! Please check your inbox.");
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
                addMessage("success", "Your email has been successfully verified.");
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
                <div className="w-full md:w-3/4">
                    <div className="mb-4">
                        <h1>My account</h1>
                        Manage your personal information and preferences
                    </div>

                    <div className="bg-muted rounded-lg">
                        <div className="p-4">
                            <div className="flex flex-wrap mb-3 -mx-4">
                                <div className="w-full sm:w-auto px-4 mb-2 sm:order-1">
                                    {!customer?.user ? (
                                        <Skeleton width={80} height={26} borderRadius={20} />
                                    ) : customer.user.verified ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                                    ) : (
                                        <Badge variant="destructive">Not verified</Badge>
                                    )}
                                </div>

                                <div className="w-full sm:flex-1 px-4">
                                    <strong>{customer?.fullName || <Skeleton width={120} />}</strong>
                                    <div>{customer?.email || <Skeleton width={180} />}</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                {!customer?.user ? (
                                    <>
                                        <Skeleton width={100} height={36} />
                                        <Skeleton width={140} height={36} />
                                        <Skeleton width={120} height={36} />
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" size="sm" render={<Link to="/account/profile/edit" />}>
                                            <IconPencil stroke={2} size={16} />
                                            Edit
                                        </Button>

                                        <Button variant="outline" size="sm" render={<Link to="/account/change-password" />}>
                                            <IconLock stroke={2} size={16} />
                                            Change password
                                        </Button>

                                        {!customer.user.verified && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                type="button"
                                                onClick={handleVerifyClick}
                                                disabled={isVerifying}
                                                className="text-primary"
                                            >
                                                {isVerifying ? (
                                                    <>
                                                        <span
                                                            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
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
                                            </Button>
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
};

export default DashboardPage;
