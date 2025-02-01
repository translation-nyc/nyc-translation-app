import {useEffect, useState} from "react";
import type {Schema} from "../amplify/data/resource";
import {generateClient} from "aws-amplify/data";
import {useAuthenticator} from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

function App() {
   

    return (
        <main>
            <h1>test</h1>
        </main>
    );
}

export default App;
