export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    status: string;
    propertyId: string;
    roleIds: string[];
}
