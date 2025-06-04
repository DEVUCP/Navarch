import { useEffect , useState} from "react";
import styles from '../styles/Console.module.css'
import { useServerStatus, getServerStatus } from "../utils/monitor";
import TurnLeftIcon from '@mui/icons-material/TurnLeft';

function Console(){
    const [consoleText, setConsoleText] = useState("The server is offline...");
    const [inputText, setInputText] = useState("");
    const isServerOnline = useServerStatus();
    const [isSendingCommand, setIsSendingCommand] = useState(false);
    
    useEffect(() => {
        const interval = setInterval( async () => {
            if(await getServerStatus() === 1 || await getServerStatus() === 2){
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
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputText.trim() === "") return;
        
        if(await getServerStatus()){
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
                onChange={(e) => setInputText(e.target.value)}
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