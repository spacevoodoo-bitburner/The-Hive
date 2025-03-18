export async function main(ns) {
  let host = ns.getHostname();
  ns.killall(host, true);
  ns.exec("/dev/queen.js", host, 1, 1000);
  await ns.sleep(1000);
  ns.exec("/dev/hive.js", host);
}
