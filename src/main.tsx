import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import './styles/Text.css';

// Configure Amplify with detailed logging
console.log("[Amplify] Starting Amplify configuration");

Amplify.configure(outputs);

// Full Amplify configuration
Amplify.configure({
    ...Amplify.getConfig(),
    Predictions: outputs.custom.Predictions,
});

// Log the complete configuration for debugging
console.log("[Amplify] Auth configuration:", {
    userPoolId: outputs.auth.user_pool_id,
    identityPoolId: outputs.auth.identity_pool_id,
    region: outputs.auth.aws_region,
    oauth: {
        domain: outputs.auth.oauth.domain,
        redirectSignIn: outputs.auth.oauth.redirect_sign_in_uri,
        redirectSignOut: outputs.auth.oauth.redirect_sign_out_uri,
        providers: outputs.auth.oauth.identity_providers,
        responseType: outputs.auth.oauth.response_type,
        scopes: outputs.auth.oauth.scopes
    }
});

console.log("[Amplify] Predictions configuration:", outputs.custom.Predictions);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);