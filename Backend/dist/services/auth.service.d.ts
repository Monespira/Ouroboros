export declare const authService: {
    register(tenantId: string, email: string, password: string, name: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            tenantId: string;
        };
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            title: string | null;
            department: string | null;
            image: string | null;
            bio: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
        };
        token: string;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map