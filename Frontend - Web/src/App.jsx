import "./App.scss";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound";
import Layout from "./pages/Layout/Layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React, { Suspense } from "react";
import CallPage from "./pages/Meeting/CallPage";
import RequireAuth from "./components/RequireAuth";
import { store, persistor } from "./utils/redux-toolkit/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import MainLoader from "./components/Loader/MainLoader";
import { ToastContainer } from "react-toastify";
const About = React.lazy(() => import("./pages/About/About"));
const Login = React.lazy(() => import("./pages/Login/Login"));
const Meeting = React.lazy(() => import("./pages/Meeting/Meeting"));
const Contact = React.lazy(() => import("./pages/Contact/Contact"));
const Profile = React.lazy(() => import("./pages/Profile/Profile"));

function App() {
	const router = createBrowserRouter([
		{
			element: <Layout />,
			children: [
				{ path: "/", element: <Home /> },
				{
					path: "/about",
					element: (
						<Suspense fallback={<MainLoader customStyle="centered" />}>
							{" "}
							<About />{" "}
						</Suspense>
					),
				},
				{
					path: "/login",
					element: (
						<Suspense fallback={<MainLoader customStyle="centered" />}>
							{" "}
							<RequireAuth>
								{" "}
								<Login />{" "}
							</RequireAuth>{" "}
						</Suspense>
					),
				},
				{
					path: "/meeting",
					element: (
						<Suspense fallback={<MainLoader customStyle="centered" />}>
							{" "}
							<Meeting />{" "}
						</Suspense>
					),
				},
				{
					path: "/call",
					element: (
						<RequireAuth>
							{" "}
							<CallPage />
						</RequireAuth>
					),
				},
				{
					path: "/call/:callId",
					element: (
						<RequireAuth>
							{" "}
							<CallPage />{" "}
						</RequireAuth>
					),
				},
				{
					path: "/contact",
					element: (
						<Suspense fallback={<MainLoader customStyle="centered" />}>
							{" "}
							<Contact />{" "}
						</Suspense>
					),
				},
				{
					path: "/profile",
					element: (
						<Suspense fallback={<MainLoader customStyle="centered" />}>
							{" "}
							<RequireAuth>
								{" "}
								<Profile />{" "}
							</RequireAuth>{" "}
						</Suspense>
					),
				},
				{ path: "*", element: <NotFound /> },
			],
		},
	]);

	return (
		<div className="App min-h-screen w-screen overflow-hidden">
			<Provider store={store}>
				<PersistGate
					loading={<MainLoader customStyle="centered" />}
					persistor={persistor}
				>
					<RouterProvider router={router} />
				</PersistGate>
			</Provider>
			<ToastContainer />
		</div>
	);
}

export default App;
