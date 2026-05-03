import React, { useState } from "react";
import LinearSpinner from "../../../components/Loader/LinearSpinner";
import Swal from "sweetalert2";
import "../../../pages/Meeting/CallPage.scss";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] =
        useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!forgotPasswordEmail.trim()) return;

        setIsSubmittingForgotPassword(true);

        // Simulate API call - replace with actual password reset logic
        try {
            // Add your password reset API call here
            // await resetPassword(forgotPasswordEmail);

            // Simulate delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setShowSuccessMessage(true);
            setTimeout(() => {
                onClose();
                setShowSuccessMessage(false);
                setForgotPasswordEmail("");
            }, 2000);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Password Reset Failed",
                text: "An error occurred while trying to reset your password. Please try again.",
                confirmButtonText: "OK",
            });
        } finally {
            setIsSubmittingForgotPassword(false);
        }
    };

    const closeForgotPasswordModal = () => {
        onClose();
        setForgotPasswordEmail("");
        setShowSuccessMessage(false);
    };

    if (!isOpen) return null;

    return (
        <div className="forgot-password-modal">
            <div
                className="modal-overlay"
                onClick={closeForgotPasswordModal}
            ></div>
            <div className="modal-content">
                {!showSuccessMessage ? (
                    <>
                        <h3>Reset Password</h3>
                        <p className="modal-description">
                            Enter your email address and we'll send you a link
                            to reset your password.
                        </p>
                        <form onSubmit={handleForgotPasswordSubmit}>
                            <div className="form-group">
                                <label htmlFor="resetEmail">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="resetEmail"
                                    value={forgotPasswordEmail}
                                    onChange={(e) =>
                                        setForgotPasswordEmail(e.target.value)
                                    }
                                    placeholder="Enter your email"
                                    required
                                    disabled={isSubmittingForgotPassword}
                                />
                            </div>
                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={closeForgotPasswordModal}
                                    disabled={isSubmittingForgotPassword}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary confirm-btn"
                                    disabled={
                                        isSubmittingForgotPassword ||
                                        !forgotPasswordEmail.trim()
                                    }
                                >
                                    {isSubmittingForgotPassword ? (
                                        <LinearSpinner customClass={"max-h-[30px]"} />
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Email Sent!</h3>
                        <p>
                            We've sent a password reset link to{" "}
                            <strong>{forgotPasswordEmail}</strong>
                        </p>
                        <p>
                            Please check your email and follow the instructions
                            to reset your password.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
