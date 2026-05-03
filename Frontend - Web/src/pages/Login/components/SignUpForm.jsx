import React from "react";
import FormInput from "./FormInput";
import ImageUpload from "./ImageUpload";
import LinearSpinner from "../../../components/Loader/LinearSpinner";

const SignUpForm = ({
	formik,
	handleInput,
	showSignUpPassword,
	setShowSignUpPassword,
	previewImage,
	setPreviewImage,
	onSignInClick,
}) => {
	const handleImageChange = (e) => {
		const file = e.currentTarget.files[0];
		formik.setFieldValue("Image", file);
		if (file) {
			const imageURL = URL.createObjectURL(file);
			setPreviewImage(imageURL);
		} else {
			setPreviewImage(null);
		}
	};

	const handleRemoveImage = () => {
		setPreviewImage(null);
		formik.setFieldValue("Image", null);
		document.getElementById("Image").value = "";
	};

	return (
		<div className="form-wrapper sign-up">
			<form onSubmit={formik.handleSubmit}>
				<h2>Sign Up</h2>

				<FormInput
					type="text"
					name="Username"
					value={formik.values.Username}
					onChange={handleInput}
					onBlur={formik.handleBlur}
					label="Username"
					error={formik.errors.Username}
					touched={formik.touched.Username}
				/>

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
					showPassword={showSignUpPassword}
					onTogglePassword={() => setShowSignUpPassword((prev) => !prev)}
				/>

				<ImageUpload
					onImageChange={handleImageChange}
					previewImage={previewImage}
					onRemoveImage={handleRemoveImage}
					error={formik.errors.Image}
					touched={formik.touched.Image}
				/>

				<button type="submit" className="btn" disabled={formik.isSubmitting}>
					{formik.isSubmitting ? <LinearSpinner /> : "Sign Up"}
				</button>

				<div className="sign-link">
					<p>
						<span className="login-description">Already have an account? </span>
						<button
							className="signIn-link font-medium btn-login"
							type="button"
							onClick={onSignInClick}
						>
							Sign In
						</button>
					</p>
				</div>
			</form>
		</div>
	);
};

export default SignUpForm;
