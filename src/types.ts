export type UserSearchOptions = {
    search?: string,
    sort?: "id" | "username" | "registeredAt" | "lastSeenAt",
    order?: "asc" | "desc",
} & PaginationOptions;

export type User = {
    id: number,
    username: string,
    description: string,
    signature: string,
    thumbnail: {
        avatar: string,
        icon: string,
    },
    
    playing: number | null,
    
    membershipType: "free" | "plus" | "plusDeluxe",
    isStaff: boolean,
    
    registeredAt: string,
    lastSeenAt: string,

    netWorth: number,
    placeVisits: number,
    profileViews: number,
    forumPosts: number,
    assetSales: number,
}

export type UserSearchResponseUser = Omit<User, "netWorth" | "placeVisits" | "profileViews" | "forumPosts" | "assetSales" | "signature">;
export type UserSearchResponse = UserSearchResponseUser[];

export type LeaderboardUser = Pick<User, "id" | "username"> & {
    avatarID: string,
    profileUrl: string,
    avatarUrl: string,
    statistic: number,
    rank: number,
}

export type FriendsOptions = {
    id: number,
} & PaginationOptions;

export type Friendship = {
    acceptedAt: string,
    user: Pick<User, "id" | "username"> & {thumbnail: string},
}

export type FriendsResponse = Friendship[];

export type PaginationOptions = {
    page?: number,
    limit?: number,
}

export type GetUserBadgesOptions = {
    id: number,
} & PaginationOptions;

export type UserBadge = {
    name: string,
    description: string,
    thumbnail: string,
    level: number | null,
}

export type UserBadgesResponse = UserBadge[];
