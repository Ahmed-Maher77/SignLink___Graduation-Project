export const NotificationPopup = ({ message, type }) =>
	message && <div className={`popup text-center ${type}`}>{message}</div>;
