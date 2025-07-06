import { useEffect , useState} from "react";
import styles from '../styles/Console.module.css'
import { useServerData } from "../utils/serverDataContext";
import TurnLeftIcon from '@mui/icons-material/TurnLeft';

const statusCodes = {
  OFFLINE: 0,
  ONLINE: 1,
  STARTING: 2,
  FETCHING: 3,
  ERROR: 4
}

function Console(){
    const [consoleText, setConsoleText] = useState("The server is offline...");
    const [inputText, setInputText] = useState("");
    const [isSendingCommand, setIsSendingCommand] = useState(false);
    const data = useServerData();
    const [serverStatus, setServerStatus] = useState(statusCodes.FETCHING);
    
    useEffect(() => {
        if (data?.status !== undefined) {
            setServerStatus(data.status);
        } else {
            setServerStatus(statusCodes.ERROR);
        }
    }, [data]);
    
    useEffect(() => {
        const interval = setInterval( async () => {
            if(serverStatus === statusCodes.ONLINE || serverStatus === statusCodes.STARTING){
            setIsSendingCommand(true);
            const response = await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/console-text`)
            const text = await response.text()
            if(response.ok){
                if(text === ""){
                    setConsoleText("Starting! Please wait...");
                }else{
                    setConsoleText(text);
                }
            }}
            else{
                setConsoleText("The server is offline...");
            }
            setIsSendingCommand(false);
        }, 2000)
        return () => clearInterval(interval);
    }, [serverStatus])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputText.trim() === "") return;
        
        if(serverStatus === statusCodes.ONLINE){
            const response = await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/console/run/${inputText}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/plain',
                }
            });
            if (response.ok) {
                console.log('Command sent successfully.');
            } else {
                alert('Failed to send command.');
                console.error('Failed to send command.');
            }
            setInputText("");
        }
        else{
            alert("The server is offline...");
        }
    };
    
    return(
        <>
        <div className={styles.viewbox}>
            <div className={styles.consoleTextBox}>
                {consoleText.split('\n').reverse().map((line, index) => (
                    <code key={index}>{line}</code>
                ))}
            </div>
        
        <form onSubmit={handleSubmit} >
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.replace(/[/\\]/g, ''))}
                placeholder="Enter command..."
                className={styles.consoleInputField}
            />
            <button type="submit" className={styles.consoleInputButton} disabled={isSendingCommand}><TurnLeftIcon /></button>
        </form>
        </div>
        </>
    );
}

export default Console;