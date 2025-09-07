// {
//     "_id": "68b884015ab98181dae69670",
//     "highlight": "",
//     "title": "Start 14–Days Free Trial",
//     "description": "Start 14–Days Free Trial",
//     "pricePerDev": 0,
//     "tokenLimitPerDev": 1000,
//     "billingCycle": "fortnightly",
//     "features": [],
//     "isFree": true,
//     "isActive": true,
//     "isDefault": true,
//     "isPublic": false,
//     "priority": 0,
//     "createdAt": "2025-09-03T18:08:01.768Z",
//     "updatedAt": "2025-09-03T18:08:01.768Z"
// }

export interface Plan {
    _id: string;
    highlight: string;
    title: string;
    description: string;
    pricePerDev: number;
    tokenLimitPerDev: number;
    externalUrl?: string;
    billingCycle: string;
    features: Feature[];
    isFree: boolean;
    isActive: boolean;
    isDefault: boolean;
    isPublic: boolean;
    priority: number;
    createdAt: string;
    updatedAt: string;
}

type Feature = {
    title: string;
    description: string;
};
