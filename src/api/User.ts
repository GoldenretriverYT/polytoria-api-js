import { FriendsOptions, FriendsResponse, GetUserBadgesOptions, LeaderboardUser, PolytoriaAPI, User, UserBadgesResponse, UserSearchOptions, UserSearchResponse, UserSearchResponseUser, polyFetch } from "../index.js";

export class Users {
    //#region Direct Wrappers
    static async getUsers(options: UserSearchOptions): Promise<UserSearchResponse> {
        if(options.limit && options.limit > 100) {
            throw new Error("Limit cannot be greater than 100. Use Users.getManyUsers instead.");
        }
        
        const body = await polyFetch("https://api.polytoria.com/v1/users?" + new URLSearchParams(options as Record<string, string>), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }) as {users: UserSearchResponse};

        return body.users;
    }

    static async getUser(id: number): Promise<User> {
        const body = await polyFetch(`https://api.polytoria.com/v1/users/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }) as User;

        return body;
    }

    static async getFriends(options: FriendsOptions): Promise<FriendsResponse> {
        const body = await polyFetch(`https://api.polytoria.com/v1/users/${options.id}/friends?` + new URLSearchParams(options as any), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }) as {friends: FriendsResponse};

        return body.friends;
    }

    static async getUserBadges(options: GetUserBadgesOptions): Promise<UserBadgesResponse> {
        const body = await polyFetch(`https://api.polytoria.com/v1/users/${options.id}/badges?` + new URLSearchParams(options as any), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }) as {badges: UserBadgesResponse};

        return body.badges;
    }
    //#endregion

    //#region Convenience Wrappers
    static async getFullUser(user: Partial<User> & {id: number}): Promise<User> {
        return this.getUser(user.id);
    }

    static async getManyUsers(options: Omit<UserSearchOptions, "page"> & {limit: number}): Promise<UserSearchResponse> {
        if(!PolytoriaAPI.handleRatelimits) throw new Error("Cannot use getManyUsers without PolytoriaAPI.handleRatelimits enabled.");
        if(options.limit <= 100) return this.getUsers(options);

        const users: UserSearchResponse = [];
        let page = 1;
        let usersRemaining = options.limit;

        const modifiedOptions = {...options};
        modifiedOptions.limit = 100;

        while(true) {
            const body = await this.getUsers({...modifiedOptions, page});
            users.push(...body);

            usersRemaining -= 100;
            
            if(body.length < 100 || usersRemaining <= 0) break;
            
            page++;
        }

        return users.slice(0, options.limit);
    }

    /**
     * Returns nUsers users that meet the specified condition.
     * 
     * Note: This will trigger a lot of requests. You might be better of using getManyUsers and filtering the results yourself, if you dont need an exact amount of users.
     * @param nUsers Amount of users to get with the condition met
     * @param searchOptions Search options to use
     * @param condition Condition to meet
     * @returns Users that meet the condition
     */
    static async getUsersWithCondition(nUsers: number, searchOptions: Omit<UserSearchOptions, "page" | "limit">, condition: (user: UserSearchResponseUser) => boolean): Promise<UserSearchResponse> {
        if(!PolytoriaAPI.handleRatelimits) throw new Error("Cannot use getUsersWithCondition without PolytoriaAPI.handleRatelimits enabled.");

        const users: UserSearchResponse = [];
        let page = 1;
        let usersRemaining = nUsers;

        while(true) {
            const body = await this.getUsers({...searchOptions, limit: 100, page});
            for(const user of body) {
                if(condition(user)) {
                    users.push(user);
                    usersRemaining--;
                }

                if(usersRemaining <= 0) break;
            }

            if(body.length < 100 || usersRemaining <= 0) break;
            
            page++;
        }

        return users.slice(0, nUsers);
    }
    //#endregion

    //#region Pauly Internal
    /**
     * 
     * @param type 
     * @param page 
     * @returns An array of 10 users that are on the leaderboard.
     * @polytoria-internal This API is an internal API and requires a valid PT_AUTH cookie.
     */
    static async getLeaderboard(type: "networth" | "visits" | "sales" | "forumposts" | "profileviews", page: number) {
        if(!PolytoriaAPI.ptAuthCookie) throw new Error("Cannot use getLeaderboard without a valid Polytoria cookie.");

        const body = await polyFetch(`https://polytoria.com/api/rankings?category=${type}&page=${page}`, {
            method: "GET",
            headers: {
                "Cookie": `PT_AUTH=${PolytoriaAPI.ptAuthCookie}`
            }
        }) as {data: LeaderboardUser[]};

        return body.data;
    }
    //#endregion
}