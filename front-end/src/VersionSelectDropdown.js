import { useEffect , useState} from "react";
import styles from './VersionSelectDropdown.module.css';

function VersionSelectDropdown(){
    
    const [versionList, setVersionList] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState("1.21.4");
    
    useEffect(() => {
        const fetchVersions = async () => {
            try{
                const response = await fetch('https://api.papermc.io/v2/projects/paper')
                const jsonVersionData = await response.json()
                setVersionList(jsonVersionData.versions.reverse())
            }
            catch (error){
                console.error(`error fetching data..`)
            }
        };
        fetchVersions();
    },[]);

    return (
    <div className="btn-group">
    
        <button className="btn btn-primary btn-sm" type="button" onClick={() => downloadServerFiles(selectedVersion)}>
            Download Server Files
        </button>

        <div className="dropdown">
        <button type="button" class="btn btn-sm btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
            <span>{selectedVersion} </span>
        </button>

        <ul 
        className={`dropdown-menu ${styles.scrollableDropdown}`}
        >
            {versionList.map((item, index) => (
                <li
                key={index} 
                className={`dropdown-item ${styles.dropdownItem}`}
                onClick={() => setSelectedVersion(item)}
                >{item}</li>
            ))}
        </ul>
        </div>
    </div>
  );
  }

  export default VersionSelectDropdown;


async function downloadServerFiles(version) {
    try{
        const response = await fetch(`http://localhost:3001/download/${version}`)
    }
    catch(error){
        console.error("no...")
    }
}