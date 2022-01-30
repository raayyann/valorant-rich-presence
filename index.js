const { ValClient } = require("valclient.js");
const RPC = require("discord-rpc");
const client = new ValClient();
const rpc = new RPC.Client({
  transport: "ipc",
});

const gamemodeToString = (mode) => {
  return mode === "unrated"
    ? "Unrated"
    : mode === "competitive"
    ? "Competitive"
    : mode === "spikerush"
    ? "Spike Rush"
    : mode === "deathmatch"
    ? "Deathmatch"
    : mode === "onefa"
    ? "Replication"
    : "Escalation";
};

console.clear();
console.log("Starting");
client
  .init({ region: "ap" })
  .then(async () => {
    rpc.once("ready", () => {
      console.clear();
      console.log("Running");
      console.log("VALORANT Rich Presence by EmangGek");
      let time = null;
      rpc.setActivity({
        details: "Loading",
        state: "Loading",
        startTimestamp: "",
        largeImageKey: "logo",
      });
      setInterval(async () => {
        try {
          const data = {
            details: "Loading",
            state: "Loading",
            startTimestamp: "",
            largeImageKey: "logo",
          };
          const session = await client.session.current();
          if (session.loopState !== "INGAME") time = null;
          if (session.loopState == "MENUS") {
            const party = await client.group.currentDetails();
            data.details = "In Menu";
            if (party.State === "CUSTOM_GAME_SETUP") {
              data.state = `Custom Game (${party.Members.length} of ${party.CustomGameData.MaxPartySize})`;
            } else {
              if (party.State === "MATCHMAKING") data.details = "In Queue";
              data.state = `${gamemodeToString(
                party.MatchmakingData.QueueID
              )} (${party.Members.length} of 5)`;
            }
          } else if (session.loopState == "PREGAME") {
            const pregame = await client.pre_game.details();
            data.details = "Agent Select";
            data.state = gamemodeToString(pregame.QueueID) || "Custom Game";
          } else if (session.loopState == "INGAME") {
            const game = await client.live_game.details();
            data.details = "In Game";
            if (time === null) {
              time = Date.now();
            }
            data.startTimestamp = time;
            if (game.ProvisioningFlow === "Matchmaking") {
              data.state = gamemodeToString(game.MatchmakingData.QueueID);
            } else {
              data.state = "Custom Game";
            }
          }
          rpc.setActivity(data);
        } catch (e) {
          console.clear();
          console.log("FAILED TO FETCH ACTIVITY");
        }
      }, 15000);
    });
    rpc.login({ clientId: "937135989330182174" });
  })
  .catch(async (e) => {
    console.clear();
    console.log("VALORANT is not running");
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  });
