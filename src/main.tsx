import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {Amplify} from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import './styles/Text.css';

Amplify.configure(outputs);

Amplify.configure({
    ...Amplify.getConfig(),
    Predictions: outputs.custom.Predictions,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App/>
	</React.StrictMode>
);