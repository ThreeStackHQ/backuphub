import { NextRequest, NextResponse } from 'next/server';
export declare function POST(req: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    user: {
        id: string;
        email: string;
        name: string;
    };
}>>;
//# sourceMappingURL=route.d.ts.map