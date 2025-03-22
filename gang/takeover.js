/** @param {NS} ns */
export async function main(ns) {
  let mooks = ["Honey", "Sugarbag", "Sweat", "Carpenter", "Digger", "Longhorn", "Cuckoo", "Squash", "Cutter"]
  let mookindex = 0;
  while (true){
    if (!ns.gang.inGang()){
      ns.gang.createGang("Slum Snakes");
      ns.gang.recruitMember("Bumble");
      ns.gang.recruitMember("Killer");
      ns.gang.recruitMember("Mason");
    }
    let members = ns.gang.getMemberNames();
    let fullup = true;
    for (let i = 0; i < members.length; ++i){
      let gangdata = ns.gang.getMemberInformation(members[i]);
      if (gangdata.str_asc_mult >= 4 && gangdata.upgrades.length < 16){
        fullup = false;
      }
    }
    for (let i = 0; i < members.length; ++i){
      let gangdata = ns.gang.getMemberInformation(members[i]);
      if (gangdata.str >= 110 && gangdata.str_asc_mult == 1){
        ns.gang.ascendMember(members[i]);
        ns.gang.setMemberTask(members[i], "Train Combat");
      } else if (gangdata.str >= 225 && gangdata.str_asc_mult > 1 && gangdata.str_asc_mult < 3){
        ns.gang.ascendMember(members[i]);
        ns.gang.setMemberTask(members[i], "Train Combat");
      } else if (gangdata.str >= 350 && gangdata.str_asc_mult > 3 && gangdata.str_asc_mult < 4){
        ns.gang.ascendMember(members[i]);
        ns.gang.setMemberTask(members[i], "Train Combat")
      } else {
        if (members.length < 12 && gangdata.str > 500){
          ns.gang.setMemberTask(members[i], "Terrorism");
        } else if (members.length == 12 && gangdata.str > 500 && !fullup){
          ns.gang.setMemberTask(members[i], "Human Trafficking");
        } else if (members.length == 12 && gangdata.str > 500 && fullup){
          ns.gang.setMemberTask(members[i], "Territory Warfare");
        }
        else if (gangdata.str < 500) {
          ns.gang.setMemberTask(members[i], "Train Combat");
        } else {
          ns.gang.setMemberTask(members[i], "Train Combat");
        }
      }
    }
    if (members.length < 12 && ns.gang.canRecruitMember()){
      ns.gang.recruitMember(mooks[mookindex]);
      mookindex += 1;
    }
    let equipment = ns.gang.getEquipmentNames();
    for (let i = 0; i < members.length; ++i){
      let gangdata = ns.gang.getMemberInformation(members[i]);
      if (gangdata.str_asc_mult >= 4){
        let curEquipment = gangdata.upgrades;
        let curAugments = gangdata.upgrades;
        for (let j = 0; j < equipment.length; ++j){
          let curCash = ns.getServerMoneyAvailable("home");
          let equipmentCost = ns.gang.getEquipmentCost(equipment[j]);
          let equipmentType = ns.gang.getEquipmentType(equipment[i]);
          if (!curEquipment.includes(equipment[j]) && !curAugments.includes(equipment[j]) && equipmentCost < curCash && equipmentType != "Rootkit"){
            ns.gang.purchaseEquipment(members[i], equipment[j]);
          }
        }
      }
    }
    await ns.sleep(10000);
  }
}
