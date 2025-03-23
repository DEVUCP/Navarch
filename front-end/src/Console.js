import { useEffect , useState} from "react";
import styles from './Console.module.css'
import { useServerStatus, getServerStatus } from "./monitor";

function Console(){
    const [consoleText, setConsoleText] = useState("The server is offline...");
    const isServerOnline = useServerStatus();
    
    useEffect(() => {
        const interval = setInterval( async () => {
            if(await getServerStatus()){
            const response = await fetch("http://156.213.133.235:3001/server/console-text")
            const text = await response.text()
            if(response.ok){
                setConsoleText(text);
            }}
        }, 2000)
        return () => clearInterval(interval);
    }, [])
    
    return(
        <div className={styles.viewbox}>
                {consoleText.split('\n').reverse().map((line, index) => (
                    <code key={index}>{line}</code>
                ))}
        </div>
    );
}

export default Console;