import React from "react";

const PredictionInfo = ({ topPrediction, getConfidenceClass, styles }) => (
	<div style={styles.infoBox}>
		<strong>Top Prediction:</strong>
		<span style={{ display: "flex", gap: 5 }}>
			{topPrediction.label}
			<span className={getConfidenceClass(topPrediction.probability)}>
				({topPrediction.probability.toFixed(2)}%)
			</span>
		</span>
	</div>
);

export default PredictionInfo;
