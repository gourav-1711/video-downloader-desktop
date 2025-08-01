import "./App.css";
import YouTubeDownloader from "./YouTubeDownloader.jsx";
import AppFrame from "./AppFrame";

function App() {
  return (
    <>
      <AppFrame />
      <div className="overflow-y-scroll">
       <YouTubeDownloader />

      </div>
     
    </>
  );
}

export default App;
