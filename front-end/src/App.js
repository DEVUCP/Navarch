import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

// import Navbar from './components/Navbar';
import ServerWindow from './components/ServerWindow';

function App() {



  return (
    <div className="App">
      {/* <Navbar></Navbar>
      <div className='sidebar-container'>
        <div class="btn-group-horizontal" role="group" aria-label="Vertical radio toggle button group">
        <input type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio1" autocomplete="off"/>
        <label class="btn btn-primary btn-lg" for="vbtn-radio1">Server</label>
        <input type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio2" autocomplete="off"/>
        <label class="btn btn-primary btn-lg" for="vbtn-radio2">Properties</label>
        <input type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio3" autocomplete="off"/>
        <label class="btn btn-primary btn-lg" for="vbtn-radio3">Software/version</label>
        </div>
      </div> */}
      <ServerWindow></ServerWindow>

    </div>
  );
}

export default App;
