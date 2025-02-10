import Toolbar from "./components/Toolbar";
import TranscriptionInterface from "./components/TranscriptionInterface.tsx";

function App() {
    return (
        <main className="w-screen h-screen flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <Toolbar/>
            <TranscriptionInterface/>
        </main>
    );
}

export default App;
