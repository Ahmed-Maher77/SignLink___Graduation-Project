import React from "react";

const ImageUpload = ({
	onImageChange,
	previewImage,
	onRemoveImage,
	error,
	touched,
}) => {
	return (
		<>
			<div className="input-group custom-file">
				<label htmlFor="Image">
					Upload Image <i className="fa-solid fa-upload"></i>
				</label>
				<input
					type="file"
					id="Image"
					name="Image"
					accept="image/*"
					onChange={onImageChange}
					style={{
						border: `1px solid ${touched ? (error ? "red" : "green") : "#333"}`,
					}}
				/>
			</div>
			{touched && error && (
				<div
					role="alert"
					aria-live="polite"
					style={{
						color: "red",
						fontSize: "0.9rem",
						width: "320px",
						marginTop: "-20px",
					}}
				>
					{error}
				</div>
			)}
			{previewImage && (
				<div
					style={{
						marginTop: "-20px",
						marginBottom: "10px",
						position: "relative",
						width: "fit-content",
					}}
				>
					<img
						src={previewImage}
						alt="Selected Preview"
						style={{
							width: "50px",
							height: "50px",
							objectFit: "cover",
							borderRadius: "50%",
							border: "1px solid #ccc",
						}}
					/>
					<button
						type="button"
						onClick={onRemoveImage}
						style={{
							position: "absolute",
							top: "-8px",
							right: "-8px",
							background: "red",
							color: "white",
							border: "none",
							borderRadius: "50%",
							width: "20px",
							height: "20px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "14px",
							cursor: "pointer",
						}}
						aria-label="Remove selected image"
					>
						<span className="fa-solid fa-xmark"></span>
					</button>
				</div>
			)}
		</>
	);
};

export default ImageUpload;
