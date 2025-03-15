/** @param {NS} ns */
export async function main(ns) {
  const servers = ns.getPurchasedServers()
  while (true){
    for (let i = 0; i < servers.length; i++){
      let ram = ns.getServerMaxRam(servers[i]) * 2;
      ns.getPurchasedServerUpgradeCost(servers[i], ram)
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram) && ram <= 2048){
        ns.upgradePurchasedServer(servers[i], ram);
      }
    }
    await ns.sleep(20000);
  }
}
