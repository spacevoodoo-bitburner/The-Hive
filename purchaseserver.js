/** @param {NS} ns */
export async function main(ns) {
  const ram = 8;
  let i = 0;
  while (i < ns.getPurchasedServerLimit()) {
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
      let hostname = ns.purchaseServer("pserv-" + i, ram);
      ++i;
    }
    await ns.sleep(1000);
  }
}
