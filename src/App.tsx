import {useAuthenticator} from "@aws-amplify/ui-react";
import type {TranslationTextEntry} from "./components/TranslationBox.tsx";
import TranslationBox from "./components/TranslationBox.tsx";
import TranslationTypeButtonRow from "./components/TranslationTypeButtonRow.tsx";
import LanguageControls from "./components/LanguageControls.tsx";

function App() {
    const {user, signOut} = useAuthenticator();

    const texts: TranslationTextEntry[] = [
        {text: "Hello!", type: "native"},
        {text: "Comment vas-tu?", type: "foreign"},
        {text: "How are you?", type: "translated"},
    ];

    return (
        <main>
            <p className="absolute top-4 left-4 text-white">
                Welcome, {user.signInDetails?.loginId}
            </p>
            <button onClick={signOut} className="regular-button absolute top-4 right-4">
                Sign out
            </button>
            <TranslationTypeButtonRow/>
            <div className="relative">
                <div className="absolute -left-44">
                    <LanguageControls/>
                </div>
            </div>
            <TranslationBox texts={texts}/>
        </main>
    );
}

export default App;
