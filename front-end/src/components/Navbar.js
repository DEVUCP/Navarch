import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

function Navbar(){

return(
    <nav class="navbar" style={{ backgroundColor: '#e3f2fd', width: '100%', position:"absolute",top:'0'}}>
    <div class="container-fluid">
      <a className="navbar-brand" href="#" 
      onClick={(e) => {
        e.preventDefault();
        navigator.clipboard.writeText("192.168.1.102:25565");
        alert("Copied to clipboard")
      }}>
        IP: 192.168.1.102:25565
        </a>
    </div>
  </nav>
);
}

export default Navbar;