import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

import Navbar from './components/Navbar';
import ServerWindow from './components/ServerWindow';
import { ServerDataProvider } from './utils/serverDataContext';


function App() {



  return (
    <div className="App" data-testid="testApp">
      <ServerDataProvider>
        <Navbar></Navbar>
      </ServerDataProvider>
      <ServerWindow></ServerWindow>

    </div>
  );
}

export default App;
