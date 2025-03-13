//WE.AI\app\pages\_middleware.js
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const session = await getSession({ req });

  if (!session) {
    return NextResponse.redirect(new URL('/landing', req.url));
  }

  return NextResponse.next();
}