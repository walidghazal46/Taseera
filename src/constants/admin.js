export const SUPER_ADMIN_EMAIL = "walidghazal46@gmail.com";

export const ADMIN_PERMISSIONS = [
  "viewUsers",
  "approvePayments",
  "editUsers",
  "suspendUsers",
  "deleteUsers",
  "viewPayments",
  "viewLogs",
  "manageAdmins",
];

export const DEFAULT_LIMITED_PERMISSIONS = {
  viewUsers: true,
  approvePayments: false,
  editUsers: false,
  suspendUsers: false,
  deleteUsers: false,
  viewPayments: true,
  viewLogs: false,
  manageAdmins: false,
};

export function buildPermissionMap(enabled = []) {
  const set = new Set(enabled);
  return ADMIN_PERMISSIONS.reduce((acc, key) => {
    acc[key] = set.has(key);
    return acc;
  }, {});
}

export function normalizePermissions(raw = {}) {
  return ADMIN_PERMISSIONS.reduce((acc, key) => {
    acc[key] = raw?.[key] === true;
    return acc;
  }, {});
}
