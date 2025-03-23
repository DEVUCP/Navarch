import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import VersionSelectDropdown from './VersionSelectDropdown';
import StartStopBtn from './StartStopBtn';
import Console from './Console';

function App() {



  return (
    <div className="App">
    <div className="container">
        <div className="sub-container">
            <h1 className="server-name">ServerName</h1>
            <Console></Console>
            <StartStopBtn></StartStopBtn>
          <VersionSelectDropdown></VersionSelectDropdown>
        </div>
    </div>
    </div>
  );
}

export default App;
