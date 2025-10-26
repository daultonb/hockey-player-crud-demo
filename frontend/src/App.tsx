import "./App.css";
import PlayersTable from "./components/players/PlayersTable";
import { ToastProvider } from "./components/ToastContainer";

function App() {
  return (
    <ToastProvider>
      <div className="App">
        <PlayersTable />
      </div>
    </ToastProvider>
  );
}

export default App;
