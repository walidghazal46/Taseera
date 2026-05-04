# Admin Dashboard Setup

This project now includes a Firebase-powered secure admin dashboard with role/permission controls.

## Implemented Features

- Firebase Authentication login (email/password + Google already integrated).
- Admin access guard:
  - Super Admin email: `walidghazal46@gmail.com`
  - Or user profile in Firestore with `role: "admin"`
- Roles:
  - `adminType: "super"`
  - `adminType: "limited"`
- Permissions map for limited admins:
  - `viewUsers`
  - `approvePayments`
  - `editUsers`
  - `suspendUsers`
  - `deleteUsers`
  - `viewPayments`
  - `viewLogs`
  - `manageAdmins`
- Users management:
  - Search
  - Status / paid filters
  - Edit user basic fields
  - Suspend / reactivate
  - Delete with confirmation
- Payment requests:
  - Approve / reject with reason
  - Approval updates `users.isPaid` and statuses
- Admin management:
  - Super Admin only
  - Add limited admin by email
  - Remove admin
- Activity logs:
  - All sensitive admin actions recorded in `adminLogs`
- Dashboard statistics cards + chart bars.
- Pagination support for users list.

## Firestore Collections

### users

- `uid`
- `name`
- `email`
- `phone`
- `role` (`user` or `admin`)
- `adminType` (`none`, `limited`, `super`)
- `permissions` (map)
- `status` (`pending`, `approved`, `rejected`, `suspended`)
- `isPaid` (boolean)
- `subscriptionType`
- `paymentDate`
- `createdAt`
- `updatedAt`

### paymentRequests

- `userId`
- `userName`
- `email`
- `amount`
- `paymentMethod`
- `paymentStatus` (`pending`, `paid`, `rejected`, `approved`)
- `requestStatus` (`pending_review`, `approved`, `rejected`)
- `rejectionReason`
- `createdAt`
- `reviewedAt`
- `reviewedBy`

### adminLogs

- `adminId`
- `adminEmail`
- `actionType`
- `targetUserId`
- `targetCollection`
- `oldData`
- `newData`
- `metadata`
- `createdAt`

## Security Rules & Indexes

- Firestore rules file: `firestore.rules`
- Firestore indexes file: `firestore.indexes.json`

Deploy with Firebase CLI:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Important Security Notes

- UI checks are not enough. Firestore rules are mandatory.
- Admin role/permission changes are Super Admin-only.
- Limited admins cannot modify or remove Super Admin.
- Sensitive operations are logged in `adminLogs`.

## Performance Notes

- Users list is paginated (`limit + startAfter`).
- Queries are indexed for filtered lists.
- Data sections are loaded lazily by active admin tab.
