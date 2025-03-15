//scan for target servers and fill a json with things we might care about
export async function scanall(ns){
  let hackskill = ns.getHackingLevel();
  var numPortsCanCrack = 0;
  if (ns.fileExists("BruteSSH.exe", "home")) {
    numPortsCanCrack = 1;
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    numPortsCanCrack = 2;
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    numPortsCanCrack = 3;
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    numPortsCanCrack = 4;
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
    numPortsCanCrack = 5;
  }
  
  let servers = [];
  let serverlist = [];
  let neighbor = ns.scan();
  for (let i = 0; i < neighbor.length; ++i) {
    let target = neighbor[i];
    if (!target.includes("pserv")){
      let obj = {}
      obj["name"] = target;
      servers.push(obj);
      serverlist.push(target);
    } 
  }

  for (let i = 0; i < servers.length; ++i){
    let target = servers[i]["name"];
    neighbor = ns.scan(target);
    for (let j = 0; j < neighbor.length; ++j){
      if (!serverlist.includes(neighbor[j]) && !neighbor[j].includes("pserv")){
        let obj = {};
        obj["name"] = neighbor[j];
        servers.push(obj);
        serverlist.push(neighbor[j]);
      }
    }
  }

  for (let i = 0; i < servers.length; ++i){
    let target = servers[i];
    let targetname = target["name"];
    target["difficulty"] = ns.getServerRequiredHackingLevel(targetname);
    target["ports"] = ns.getServerNumPortsRequired(targetname);
    target["maxmoney"] = ns.getServerMaxMoney(targetname);
    target["maxram"] = ns.getServerMaxRam(targetname);
    target["minsecurity"] = ns.getServerMinSecurityLevel(targetname);
    target["hackwaggle"] = 1;
    target["growwaggle"] = 1;
    target["weakenwaggle"] = 0.1;
  }

  let targets = [];
  for (let i = 0; i < servers.length; ++i){
    if (servers[i]["difficulty"] < hackskill && servers[i]["ports"] <= numPortsCanCrack){
      targets.push(servers[i]);
    }
  }

  return targets;
}
