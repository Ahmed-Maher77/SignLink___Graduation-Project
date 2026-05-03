export const stopCamera = () => {
	navigator.mediaDevices
		.getUserMedia({ video: true, audio: true })
		.then((stream) => {
			stream.getTracks().forEach((track) => track.stop());
		});
};
