import { NextRequest, NextResponse } from 'next/server';
export declare function POST(req: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    user: {
        id: string;
        name: string;
        email: string;
    };
}>>;
//# sourceMappingURL=route.d.ts.map