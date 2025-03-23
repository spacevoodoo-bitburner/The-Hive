/** @param {NS} ns */
export async function main(ns) {
  const ram = 8;
  let i = ns.getPurchasedServers().length;
  while (i < ns.getPurchasedServerLimit()) {
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
      ns.purchaseServer("pserv-" + i, ram);
      ns.scp("/dev/hive.js", "pserv-" + i);
      ns.scp("/dev/worker.js", "pserv-" + i);
      ns.scp("/dev/scanner.js", "pserv-" + i);
      ns.scp("/dev/queen.js", "pserv-" + i);
      ns.scp("/dev/restarthive.js", "pserv-" + i);
      ns.exec("/dev/queen.js", "pserv-" + i, 1, 1000);
      await ns.sleep(100);
      ns.exec("/dev/hive.js", "pserv-" + i);
      ++i;
    }
    await ns.sleep(1000);
      
  }
  while (i == ns.getPurchasedServerLimit()){
    const servers = ns.getPurchasedServers()
    for (let j = 0; j < servers.length; j++){
      let ram = ns.getServerMaxRam(servers[j]) * 2;
      ns.getPurchasedServerUpgradeCost(servers[j], ram)
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram) && ram < ns.args[0]){
        ns.upgradePurchasedServer(servers[j], ram);
      }
    }
    await ns.sleep(10000);
  }
}
