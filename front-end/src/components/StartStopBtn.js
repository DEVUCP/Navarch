import { useEffect, useState } from "react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useServerData } from "../utils/serverDataContext";
import styles from "../styles/StartStopBtn.module.css";

const statusCodes = {
  OFFLINE: 0,
  ONLINE: 1,
  STARTING: 2,
  FETCHING: 3,
  ERROR: 4
}
function StartStopBtn(){

      
  const [serverStatus, setServerStatus] = useState(statusCodes.FETCHING);
  const data = useServerData();

  useEffect(() => {
    if (data?.status !== undefined) {
      setServerStatus(data.status);
    } else {
      setServerStatus(statusCodes.ERROR);
    }
  }, [data]);
      
  const modalRef = useRef();

  const handleOpenModal = () => {
    modalRef.current?.openModal();
  };

  async function startStopServer(){
    try{
      if(serverStatus === statusCodes.ONLINE){
        await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/stop`, {method: "PUT"})
        setServerStatus(statusCodes.OFFLINE);    
      }
      else if(serverStatus === statusCodes.OFFLINE){
        const response = await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/start`, {method: "PUT"})
          if ((await response.text()).includes("EULA")){
              handleOpenModal();
              return;
          }
          setServerStatus(statusCodes.STARTING);  
      }
      }
      catch(error){
          alert("Failed to start/stop server, API might be offline");
          console.error(error);
      }
  }
      
  return(
  <>
  <SimpleModal ref={modalRef}/>
  <button 
      type="button" 
      onClick={startStopServer} 
      className={`${styles.button} ${serverStatus === statusCodes.OFFLINE ? styles.success : serverStatus === statusCodes.ONLINE ? styles.danger : serverStatus === statusCodes.STARTING ? styles.warning : serverStatus === statusCodes.ERROR ? styles.secondary : styles.secondary}`}
      id="start-stop-btn"
      disabled={serverStatus === statusCodes.STARTING || serverStatus === statusCodes.FETCHING || serverStatus === statusCodes.ERROR}>
          {serverStatus === statusCodes.OFFLINE ? "Start Server" : serverStatus === statusCodes.ONLINE ? "Stop Server" : serverStatus === statusCodes.STARTING ? "Starting..." : serverStatus === statusCodes.ERROR ? "API Offline" : "Fetching info..."}
      </button>
  </>
  )
}

export default StartStopBtn;

const SimpleModal = forwardRef((props, ref) => {
  const dialogRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openModal: () => {
      dialogRef.current?.showModal();
    },
    closeModal: () => {
      dialogRef.current?.close();
    }
  }));

  const handleAccept = async () => {
    alert("Accepted!");
    await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/sign-eula`, {method: "PUT"})
    dialogRef.current?.close();
  };

  const handleReject = () => {
    alert("Rejected!");
    dialogRef.current?.close();
  };

  return (
    <dialog ref={dialogRef} style={modalStyles.dialog}>
      <p>To continue you must accept <a href="https://aka.ms/MinecraftEULA">Mojang's EULA</a></p>
      <div style={modalStyles.buttons}>
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleReject}>Reject</button>
      </div>
    </dialog>
  );
});

const modalStyles = {
  dialog: {
    padding: "1.5em",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1em",
    gap: "1em"
  }
};
