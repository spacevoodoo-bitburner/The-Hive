import { scanall } from "/dev/scanner.js";

/** @param {NS} ns */
export async function main(ns) {
  const servers = await scanall(ns);
  const pservers = ns.getPurchasedServers();
  for (let i = 0; i < pservers.length; ++i){
    ns.killall(pservers[i]);
  }
  for (let i = 0; i < servers.length; ++i){
    let target = servers[i]["name"];
    if (ns.fileExists("BruteSSH.exe", "home")) {
      ns.brutessh(target);
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
      ns.ftpcrack(target);
    }
    if (ns.fileExists("relaySMTP.exe", "home")) {
      ns.relaysmtp(target);
    }
    if (ns.fileExists("HTTPWorm.exe", "home")) {
      ns.httpworm(target);
    }
    if (ns.fileExists("SQLInject.exe", "home")) {
      ns.sqlinject(target);
    }
    ns.nuke(target);
    ns.killall(target, true);
  }
}
