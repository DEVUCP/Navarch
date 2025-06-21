import { useEffect, useState } from "react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useServerStatus, getServerStatus } from "../utils/monitor";

function StartStopBtn(){
      
  const [serverStatus, setServerStatus] = useState(3);

  useEffect(() => {
      const interval = setInterval( async () => {
        if(await getServerStatus() === 1){
          setServerStatus(1);
        }
        else if(await getServerStatus() === 2){
          setServerStatus(2);
        }
        else{
          setServerStatus(0);
        };
      }, 2000)
      return () => clearInterval(interval);
  }, [])
      
  const modalRef = useRef();

  const handleOpenModal = () => {
    modalRef.current?.openModal();
  };

  async function startStopServer(){
      try{
      if(serverStatus){
          await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/stop`, {method: "PUT"})
          setServerStatus(0);    
      }
      else{
          const response = await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/start`, {method: "PUT"})
          if ((await response.text()).includes("EULA")){
              handleOpenModal();
              return;
          }
          setServerStatus(2);  
      }
      }
      catch(error){
          console.error(error);
      }
  }
      
  return(
  <>
  <SimpleModal ref={modalRef}/>
  <button 
      type="button" 
      onClick={startStopServer} 
      className={"btn btn-lg " + "btn-"+ (serverStatus === 0 ? "success" : serverStatus === 1 ? "danger" : serverStatus === 2 ? "warning" : "secondary") +" w-100"} 
      id="start-stop-btn"
      disabled={serverStatus === 2 || serverStatus === 3}
      style={{outline: "0.25em solid black",borderRadius: ".25em"}}>
          {serverStatus === 0 ? "Start Server" : serverStatus === 1 ? "Stop Server" : serverStatus === 2 ? "Starting..." : "Fetching info..."}
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
    <dialog ref={dialogRef} style={styles.dialog}>
      <p>To continue you must accept <a href="https://aka.ms/MinecraftEULA">Mojang's EULA</a></p>
      <div style={styles.buttons}>
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleReject}>Reject</button>
      </div>
    </dialog>
  );
});

const styles = {
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
