// import { createCookie } from "@remix-run/node";
//
// // 🍪 Order token cookie
// export const orderTokenCookie = createCookie("orderToken", {
//     path: "/",
//     httpOnly: false, // musi być false jeśli ustawiasz z client-side
//     sameSite: "lax",
//     maxAge: 60 * 60 * 24 * 30, // 30 dni
// });
//
// // 🔐 JWT token cookie – dostępny w JS, ale bezpieczny (możesz ustawić httpOnly: true jeśli nie potrzebujesz w JS)
// export const jwtTokenCookie = createCookie("jwtToken", {
//     path: "/",
//     sameSite: "lax",
//     secure: true,               // wymagane HTTPS
//     httpOnly: false,            // jeśli chcesz go używać w JS (np. localStorage-like)
//     maxAge: 60 * 60 * 24 * 7,   // tydzień
// });
