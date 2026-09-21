import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  
  // Brutally delete ALL cookies to absolutely guarantee logout
  request.cookies.getAll().forEach(cookie => {
    response.cookies.delete(cookie.name);
  });

  return response;
}