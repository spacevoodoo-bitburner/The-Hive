This is early game hacking code for the coding game Bitburner.  It will get updated as I play more of the game, clean it up, add new tasks, etc.  It uses a beehive algorithm to prioritize
hacking targets and uses differential evolution (sort of) to manage the probabilities that particular hacking tasks will be performed.  Swarm.js manages all the hives.  Hive.js manages queens
and workers in a particular hive.  Queen.js controls what ratios of workers are created for particular tasks.  Worker.js does things to targets and then tells the hive how juicy the target was.

App is now in a functional state.  It was making good money before but now it will fully utilize server resources and hammer the best things until it runs out and any port in a storm when there are no high waggles coming in.  The swarm may need to be restarted a couple of times initially.  It doesn't seem to kick off right if the game autosaves while it is running.  Adding my killall script now.  However all breaking bugs seem to be worked out.

Some things to to keep in mind if anyone draws from this code.  This is optimized around 262 TB servers.  I really wouldn't use it with less than 512 GB on home and then I would tweak the execs in hive.js to use 1 thread rather than 16.  Use a basic hacking script if you don't have enough ram to support a decentish population and don't kick something like this off until you do.  It's basically useless if you only have 2 bees and the more bees (and hives) you have the better it works.  Not bothering with it atm but it might be worth it to stop using hacked servers as hives at a certain point since most of them can no longer run a hive once worker thread size increases to a certain point.  Hacked servers are a good source of free hives in the early game but very quickly they pretty much only are useful as targets and purchased servers are where the magic happens.

How long the system should "remember" waggles is also dependent on population size.  As servers grow and start attacking higher level targets, waggles get really high and it can take a lot to get close to the highest value getting returned.  If one server has way better production than the others they hive will just want to bully that server, which is fine, but it means that it won't grow fast enough to utilize all it's space.  To keep this from happening, waggles decay by 1/2 at regular intervals.  Currently this is tied to port assignment.  The loop cycles every 10 ms and somewhere from 1 to servers.length ports will be assigned every time, so every so many ports the system will decay it's max waggle.  Adjust this according to hive size.  If the hive is maxing out really quick and never shuffling at all, you may want to remember your waggles longer so you don't waste your time on sub-optimal servers.  If it's never getting up to max utilization, decay faster so that it will fill out the empty space.
