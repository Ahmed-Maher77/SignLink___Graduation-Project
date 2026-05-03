import React from "react";

const FormInput = ({
	type = "text",
	name,
	value,
	onChange,
	onBlur,
	label,
	error,
	touched,
	showPassword,
	onTogglePassword,
	isPassword = false,
}) => {
	return (
		<div className="input-group">
			<input
				type={isPassword ? (showPassword ? "text" : "password") : type}
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				style={{
					border: `1px solid ${touched ? (error ? "red" : "green") : "#333"}`,
				}}
			/>
			<label htmlFor={name}>{label}</label>
			{isPassword && (
				<button
					type="button"
					className="absolute right-4 top-[20px] translate-y-[-50%] hover:text-slate-600 trans-3"
					onClick={onTogglePassword}
				>
					<span
						className={`fa-solid ${
							showPassword ? "fa-eye-slash" : "fa-eye"
						} text-lg`}
					></span>
				</button>
			)}
			{touched && error && (
				<div
					role="alert"
					aria-live="polite"
					style={{
						color: "red",
						fontSize: "0.9rem",
						width: "320px",
						marginTop: "0px",
					}}
				>
					{error}
				</div>
			)}
		</div>
	);
};

export default FormInput;
