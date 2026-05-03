import React from "react";

const VideoFeed = ({
	videoRef,
	canvasRef,
	// VIDEO_WIDTH,
	// VIDEO_HEIGHT,
	styles,
}) => (
	<div style={styles.videoContainer}>
		<video
			ref={videoRef}
			autoPlay
			playsInline
			muted
			style={styles.videoElement}
		/>
		<canvas
			ref={canvasRef}
			// width={VIDEO_WIDTH}
			// height={VIDEO_HEIGHT}
			style={{ display: "none" }}
		/>
	</div>
);

export default VideoFeed;
