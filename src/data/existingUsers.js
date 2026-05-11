// Existing users — trial ends May 15, 2026.
// walidghazal51@yahoo.com and walidghazal61@live.com excluded (treated as new users).

export const EXISTING_USER_EMAILS = new Set([
  "abdallah72.zaki74@gmail.com",
  "adamgm1987@gmail.com",
  "ahmed2005xp@gmail.com",
  "ahmedsaidhalim@gmail.com",
  "anwerzaid151@gmail.com",
  "e.hany.elsayed@gmail.com",
  "eng.ehssanaelatfy@gmail.com",
  "haythamozom@gmail.com",
  "hishamrabea1907@gmail.com",
  "jihadaldin9@gmail.com",
  "john.doe@example.com",
  "khalid9800065@gmail.com",
  "lyissa253@gmail.com",
  "mahmoudbasheer2@gmail.com",
  "mhmd.mhmd.r.k@gmail.com",
  "mohandes135@gmail.com",
  "newuser@example.com",
  "omyousif477@gmail.com",
  "procacdubai2017@gmail.com",
  "sherifheikal14@gmail.com",
  "test@example.com",
  "testuser@example.com",
  "walidghazal46@gmail.com",
]);

export const EXISTING_USER_TRIAL_START = new Date("2026-05-05T00:00:00.000Z");
export const EXISTING_USER_TRIAL_END   = new Date("2026-05-15T23:59:59.000Z");

export function isExistingUser(email) {
  return email && EXISTING_USER_EMAILS.has(email.toLowerCase().trim());
}
