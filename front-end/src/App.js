import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import VersionSelectDropdown from './VersionSelectDropdown';

function App() {
  return (
    <div className="App">
    <div className="container">
        <div className="sub-container">
            <h1 className="server-name">ServerName</h1>
            <button type="button" className="btn btn-success w-100" id="start-stop-btn">Start Server</button>
            {/* <button type="button" class="btn btn-primary w-100" id="download-server">Download server files<select class="w-100"></select></button> */}
          <VersionSelectDropdown></VersionSelectDropdown>
        </div>
    </div>
    </div>
  );
}

export default App;
