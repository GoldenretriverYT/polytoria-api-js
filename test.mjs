import "dotenv/config";
import { Users } from "./dist/api/User.js";
import { PolytoriaAPI } from "./dist/index.js";

(async () => {
  PolytoriaAPI.ptAuthCookie = process.env.COOKIE;
  const lb = await Users.getUsersUntilCondition(
    {
      limit: 100,
      page: 1,
      sort: "lastSeenAt",
      order: "desc",
    },
    (user) =>
      new Date(user.lastSeenAt) >
      new Date(Date.now() - (1000 * 60 * 60 * 4 + 120000))
  );
  console.log(lb);
})();
