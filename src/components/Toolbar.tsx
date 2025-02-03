import {Button, useAuthenticator} from "@aws-amplify/ui-react";
import {ProfileIcon} from "../assets/icons";
import "../styles/Toolbar.css";

function Toolbar() {
    const {signOut} = useAuthenticator();

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-4"> {/* Container for logo and dropdown*/}
                <h1 className="text-3xl font-bold text-gray-800"> {/* Logo */}
                    Conversate.
                </h1>
                {/* dropdown menu for tools */}
            </div>

            <div className="flex items-center space-x-2"> {/* Container for dark mode button and sign in button*/}
                {/* <Button>
                    darkmode
                </Button> */}
                <Button className="logout-button" size="small" onClick={signOut}> {/* Log in button */}
                    <ProfileIcon className="mr-2 h-4 w-4"/>
                    Logout
                </Button>
            </div>
        </header>
    );
}

export default Toolbar;
