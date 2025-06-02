import { useEffect, useState } from "react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useServerStatus } from "../utils/monitor";

function StartStopBtn(){
        
        const [serverStatus, setServerStatus] = useState(useServerStatus());
        
        const modalRef = useRef();

        const handleOpenModal = () => {
            modalRef.current?.openModal();
        };

        async function startStopServer(){
            try{
            if(serverStatus){
                await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/stop`, {method: "PUT"})
                setServerStatus(false);    
            }
            else{
                const response = await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/start`, {method: "PUT"})
                if ((await response.text()).includes("EULA")){
                    handleOpenModal();
                    return;
                }
                setServerStatus(true);  
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
            className={"btn btn-lg " + "btn-"+ (!serverStatus ? "success" : "danger") +" w-100"} 
            id="start-stop-btn"
            style={{outline: "0.25em solid black",borderRadius: ".25em"}}>
                {!serverStatus ? "Start "+"Server" : "Stop " +"Server"}
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
    await fetch("http://localhost:3001/server/sign-eula", {method: "PUT"})
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
