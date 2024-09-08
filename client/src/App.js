import {Routes,Route} from "react-router-dom"
import Lobby from "./Pages/Lobby";
import Room from "./Pages/Room";
import NotFound from "./Pages/NotFound";
function App() {
  return (
        <Routes>
      <Route path="/" element={<Lobby/>}></Route>
      <Route path="/room/:roomId" element={<Room/>}></Route>
      <Route path="/*" element={<NotFound/>}></Route>
        </Routes>
  );
}

export default App;
