import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { type SessionData, sessionOptions } from "@/lib/session";

export const proxy = async (req: NextRequest) => {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
};

export const config = {
  matcher: ["/", "/((?!api|_next|fonts|static|login|favicon.ico).*)"],
};
