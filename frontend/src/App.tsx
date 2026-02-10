import { ApiProvider } from "./context/ApiContext";
import CategoryLayout from "./layouts/Category/CategoryLayout";

function App() {
  return (
    <ApiProvider baseUrl="http://localhost:3000">
      <CategoryLayout />
    </ApiProvider>
  );
}

export default App;
