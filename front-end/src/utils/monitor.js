import { useState, useEffect } from "react";

export const useServerStatus = () => {
    const [serverStatus, setServerStatus] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/check-server`);
                const data = await response.json();
                setServerStatus(data);
            } catch (error) {
                console.error("Failed to fetch server status:", error);
                setServerStatus(false);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return serverStatus;
};

export const getServerStatus = async () => {
    try {
        const response = await fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/server/check-server`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch server status:", error);
        return 4;
    }
}