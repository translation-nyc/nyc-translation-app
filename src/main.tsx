import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {Amplify} from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import './styles/Text.css';

Amplify.configure(outputs, { ssr: false });

// Log configuration for debugging
console.log("Auth config:", {
    userPoolId: outputs.auth.user_pool_id,
    identityPoolId: outputs.auth.identity_pool_id,
    oauth: outputs.auth.oauth
});

Amplify.configure({
    ...Amplify.getConfig(),
    Predictions: outputs.custom.Predictions,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App/>
	</React.StrictMode>
);