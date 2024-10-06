import "dotenv/config";
import Users from "./dist/api/User.js";
import PolytoriaAPI from "./dist/index.js";

(async() => {
    PolytoriaAPI.ptAuthCookie = process.env.COOKIE;
    const lb = await Users.getLeaderboard("networth", 1);
    console.log(lb);
})();