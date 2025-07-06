import React, { createContext, useContext, useEffect, useState } from 'react';

const ServerDataContext = createContext(null);
export const ServerDataProvider = ({ children }) => {
  const [data, setData] = useState({
    memoryUsage: {
      cpu: "0%",
      usedMB: "0",
    },
    platform: null,
    version: null,
    directorySizeMB: null,
    uptime: null,
    allow_nether: null,
    broadcast_console_to_ops: null,
    broadcast_rcon_to_ops: null,
    difficulty: null,
    enable_command_block: null,
    enable_jmx_monitoring: null,
    enable_rcon: null,
    enable_status: null,
    enforce_whitelist: null,
    entity_broadcast_range_percentage: null,
    force_gamemode: null,
    function_permission_level: null,
    gamemode: null,
    generate_structures: null,
    hardcore: null,
    hide_online_players: null,
    level_name: null,
    level_seed: null,
    level_type: null,
    max_players: null,
    max_tick_time: null,
    max_world_size: null,
    motd: null,
    network_compression_threshold: null,
    online_mode: null,
    op_permission_level: null,
    player_idle_timeout: null,
    prevent_proxy_connections: null,
    pvp: null,
    query_port: null,
    rate_limit: null,
    rcon_password: null,
    rcon_port: null,
    require_resource_pack: null,
    resource_pack: null,
    resource_pack_prompt: null,
    resource_pack_sha1: null,
    server_ip: null,
    server_port: null,
    simulation_distance: null,
    spawn_animals: null,
    spawn_monsters: null,
    spawn_npcs: null,
    spawn_protection: null,
    sync_chunk_writes: null,
    text_filtering_config: null,
    use_native_transport: null,
    view_distance: null,
    white_list: null
  });

  const toSnakeCase = str => str.replace(/-/g, '_').replace(/\./g, '_');


  useEffect(() => {
    console.log("Updated context data:", data);
  }, [data]);

  const normalizeKeys = obj =>
    Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [toSnakeCase(key), value])
    );

  useEffect(() => {
    const fetchData = async () => {
  try {
      const [infores, propertiesResRaw] = await Promise.all([
        fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/info/`).then(res => res.json()),
        fetch(`http://${localStorage.getItem("ipAddress")}:${localStorage.getItem("port")}/properties/`).then(res => res.json()),
      ]);

      const propertiesRes = normalizeKeys(propertiesResRaw);


      // console.log("infores:", infores);
      // console.log("propertiesResRaw:", propertiesResRaw);
      // console.log("normalized propertiesRes:", propertiesRes);
      // console.log("data:", data);

      setData(prev => ({
        ...prev,
        ...infores,
        ...propertiesRes
      }));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };



    fetchData();
    const interval = setInterval(fetchData, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <ServerDataContext.Provider value={data}>
      {children}
    </ServerDataContext.Provider>
  );
};

export const useServerData = () => useContext(ServerDataContext);
