    import { useEffect, useState } from "react";
    import { useServerStatus } from "../utils/monitor";

    function StartStopBtn(){
        
        const [serverStatus, setServerStatus] = useState(useServerStatus());
        

        async function startStopServer(){
            try{
            if(serverStatus){
                await fetch("http://localhost:3001/server/stop")
                setServerStatus(false);    
            }
            else{
                await fetch("http://localhost:3001/server/start")
                setServerStatus(true);  
            }
            }
            catch(error){
                console.error(error);
            }
        }
        
        return(<button 
            type="button" 
            onClick={startStopServer} 
            className={"btn btn-lg " + "btn-"+ (!serverStatus ? "success" : "danger") +" w-100"} 
            id="start-stop-btn"
            style={{outline: "0.25em solid black",borderRadius: ".25em"}}>
                {!serverStatus ? "Start "+"Server" : "Stop " +"Server"}
            </button>
    )
    }


    export default StartStopBtn;