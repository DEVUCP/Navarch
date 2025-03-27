import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

function TabButtons({ taboption }){
    return(
    <div className='sidebar-container'>
        <div className="btn-group-horizontal" role="group" aria-label="Vertical radio toggle button group">
          <input type="radio" className="btn-check" name="vbtn-radio" id="vbtn-radio1" autocomplete="off"
          onClick={
            (e) =>{
            e.preventDefault();
            taboption("info-tab")
            }
        }
          />
          <label className="btn btn-primary btn-lg" for="vbtn-radio1">Server</label>
          
          <input type="radio" className="btn-check" name="vbtn-radio" id="vbtn-radio2" autocomplete="off"
          onClick={
            (e) =>{
            e.preventDefault();
            taboption("properties-tab")
            }
        }
          />
          <label className="btn btn-primary btn-lg" for="vbtn-radio2">Properties</label>
          
          <input type="radio" className="btn-check" name="vbtn-radio" id="vbtn-radio3" autocomplete="off" 
          onClick={
            (e) =>{
            e.preventDefault();
            taboption("version-tab")
            }
        }
          />
          <label className="btn btn-primary btn-lg" for="vbtn-radio3">Software/version</label>
        </div>
    </div>
    );
}

export default TabButtons;