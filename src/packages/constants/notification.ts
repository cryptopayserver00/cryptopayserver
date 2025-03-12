export type NOTIFICATION = {
  id: number;
  title: string;
  status?: boolean;
};

export const NOTIFICATIONS: NOTIFICATION[] = [
  {
    id: 1,
    title: 'New version',
  },
  {
    id: 2,
    title: 'New user requires approval',
  },
  {
    id: 3,
    title: 'User accepted invitation',
  },
  {
    id: 4,
    title: 'Plugin update',
  },
  {
    id: 5,
    title: 'All invoice updates',
  },
  {
    id: 6,
    title: 'Invoice was paid after expiration',
  },
  {
    id: 7,
    title: 'Invoice expired with partial payments',
  },
  {
    id: 8,
    title: 'Invoice has payments that failed to confirm on time',
  },
  {
    id: 9,
    title: 'Invoice is settled',
  },
  {
    id: 10,
    title: 'Payouts',
  },
  {
    id: 11,
    title: 'External payout approval',
  },
];

export const NOTIFICATION_TYPE = {
  Invoice: 'Invoice',
  Payouts: 'Payouts',
  Transaction: 'Transaction',
  NewVersion: 'New Version',
  PluginUpdates: 'Plugin Updates',
  UserUpdates: 'User Updates',
};
