import { Button } from "@aws-amplify/ui-react";
import {ProfileIcon} from "../assets/icons";
import "../styles/Toolbar.css";
import { signInWithRedirect } from "aws-amplify/auth";

function Toolbar() {

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-4"> {/* Container for logo and dropdown*/}
                <h1 className="text-3xl font-bold text-gray-800"> {/* Logo */}
                    Conversate.
                </h1>
                {/* dropdown menu for tools */}
            </div>

            <div className="flex items-center space-x-2"> {/* Container for dark mode button and sign in button*/}
                {/* Log in button */}
                <Button className="logout-button" size="small" 
                    onClick={() =>
                        signInWithRedirect({
                            provider: { custom: "Microsoft" },
                        })
                }>
                    <ProfileIcon className="mr-2 h-4 w-4"/>
                    Log In
                </Button>
            </div>
        </header>
    );
}

export default Toolbar;
