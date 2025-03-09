import { useEffect , useState} from "react";
import styles from './VersionSelectDropdown.module.css';

function VersionSelectDropdown(){
    
    const [versionList, setVersionList] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState("1.21.4");
    const [alertMessage, setAlertMessage] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState(false);
    const [disableDownloadBtn, setDisableDownloadBtn] = useState(false);


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

    async function checkServerFilesExist() {
        try{
            const response = await fetch(`http://localhost:3001/server/files/check-exist`)
            const filesExist = await response.json()
            console.log(filesExist)
            return filesExist;

        }catch(error){
            console.error(error)
        }
    }

    async function downloadServerFiles(version) {
        
        setDisableDownloadBtn(true);        
        try{
            const response = await fetch(`http://localhost:3001/server/download/${version}`)
            if(response.ok){
                setDownloadStatus(true)
                setAlertMessage("Server Files Successfully Downloaded")
                setDisableDownloadBtn(false);        
            }else{
                switch (response.status){
                    case 409:
                        setDownloadStatus(false)
                        setAlertMessage("Too many requests, please wait for download to complete")
                        setDisableDownloadBtn(false);        

                        break;
                    case 500:
                        setDownloadStatus(false)
                        setAlertMessage("Error while trying to download server files...")
                        setDisableDownloadBtn(false);        
                        break;
                    default:
                        console.log("huhhhhh")
                    }
                }
            }
        catch(error){
            console.error("no...")
        }
    }


    return (
        <>
        <div className="modal fade" id="fileExistModal" tabIndex="-1" aria-labelledby="FileExistLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
            <div className="modal-header">
                <h1 className="modal-title fs-5" id="FileExistLabel">Warning!</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Files already exist, are you sure you want to continue?
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" type="button" data-bs-dismiss="modal">
                    Cancel download
                </button>
                <button className="btn btn-success" type="button" data-bs-dismiss="modal" onClick={() => downloadServerFiles(selectedVersion)}>
                    Proceed to download
                </button>
            </div>
            </div>
        </div>
        </div>
        {alertMessage && (
            <div 
            className={"alert "+"alert-" + (downloadStatus ? "success" : "danger")}
            role="alert"
            >
                <button type="button" className="btn-close" onClick={() => setAlertMessage("")} aria-label="Close"></button>
                {alertMessage}
            </div>
        )}
        <div className="btn-group" role="group">
        <button type="button" className="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#fileExistModal" disabled={disableDownloadBtn}>
            Download Server Files
        </button>

        <div className="dropdown">
        <button type="button" className="btn btn-lg btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
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
    </>
  );
  }

  export default VersionSelectDropdown;


 