import React, { useState } from "react";
import FormInput from "./FormInput";
import LinearSpinner from "../../../components/Loader/LinearSpinner";
import ForgotPasswordModal from "./ForgotPasswordModal";

const SignInForm = ({
    formik,
    handleInput,
    showLoginPassword,
    setShowLoginPassword,
    onSignUpClick,
}) => {
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleForgotPasswordClick = (e) => {
        e.preventDefault();
        setShowForgotPassword(true);
    };

    const closeForgotPasswordModal = () => {
        setShowForgotPassword(false);
    };

    return (
        <>
            <div className="form-wrapper sign-in">
                <form onSubmit={formik.handleSubmit}>
                    <h2>Login</h2>

                    <FormInput
                        type="email"
                        name="Email"
                        value={formik.values.Email}
                        onChange={handleInput}
                        onBlur={formik.handleBlur}
                        label="Email"
                        error={formik.errors.Email}
                        touched={formik.touched.Email}
                    />

                    <FormInput
                        name="Password"
                        value={formik.values.Password}
                        onChange={handleInput}
                        onBlur={formik.handleBlur}
                        label="Password"
                        error={formik.errors.Password}
                        touched={formik.touched.Password}
                        isPassword={true}
                        showPassword={showLoginPassword}
                        onTogglePassword={() =>
                            setShowLoginPassword((prev) => !prev)
                        }
                    />

                    <div className="forgot-pass mt-2">
                        <a href="#" onClick={handleForgotPasswordClick}>
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? <LinearSpinner /> : "Login"}
                    </button>

                    <div className="sign-link">
                        <p>
                            <span className="login-description">
                                Don't have an account?{" "}
                            </span>
                            <button
                                className="signUp-link font-medium btn-login"
                                type="button"
                                onClick={onSignUpClick}
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </form>
            </div>

            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={closeForgotPasswordModal}
            />
        </>
    );
};

export default SignInForm;
