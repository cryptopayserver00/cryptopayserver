import { COINS } from './blockchain';

export const CURRENCY = [
  'USD', // 美元
  'AED', // 阿联酋迪拉姆
  'ARS', // 阿根廷比索
  'AUD', // 澳大利亚元
  'BDT', // 孟加拉塔卡
  'BHD', // 巴林第纳尔
  'BMD', // 百慕大元
  'BRL', // 巴西雷亚尔
  'CAD', // 加拿大元
  'CHF', // 瑞士法郎
  'CLP', // 智利比索
  'CNY', // 人民币
  'CZK', // 捷克克朗
  'DKK', // 丹麦克朗
  'EUR', // 欧元
  'GBP', // 英镑
  'GEL', // 格鲁吉亚拉里
  'HKD', // 港元
  'HUF', // 匈牙利福林
  'IDR', // 印尼卢比
  'ILS', // 以色列新谢克尔
  'INR', // 印度卢比
  'JPY', // 日元
  'KRW', // 韩元
  'KWD', // 科威特第纳尔
  'LKR', // 斯里兰卡卢比
  'MMK', // 缅甸元
  'MXN', // 墨西哥比索
  'MYR', // 马来西亚林吉特
  'NGN', // 尼日利亚奈拉
  'NOK', // 挪威克朗
  'NZD', // 新西兰元
  'PHP', // 菲律宾比索
  'PKR', // 巴基斯坦卢比
  'PLN', // 波兰兹罗提
  'RUB', // 俄罗斯卢布
  'SAR', // 沙特里亚尔
  'SEK', // 瑞典克朗
  'SGD', // 新加坡元
  'THB', // 泰铢
  'TRY', // 土耳其里拉
  'TWD', // 新台币
  'UAH', // 乌克兰赫夫尼亚
  'VEF', // 委内瑞拉玻利瓦尔
  'VND', // 越南盾
  'ZAR', // 南非兰特
  'XDR', // 特别提款权
];

export const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: '$', // 美元
  AED: 'د.إ', // 阿联酋迪拉姆
  ARS: '$', // 阿根廷比索
  AUD: '$', // 澳大利亚元
  BDT: '৳', // 孟加拉塔卡
  BHD: '.د.ب', // 巴林第纳尔
  BMD: '$', // 百慕大元
  BRL: 'R$', // 巴西雷亚尔
  CAD: '$', // 加拿大元
  CHF: 'CHF', // 瑞士法郎
  CLP: '$', // 智利比索
  CNY: '¥', // 人民币
  CZK: 'Kč', // 捷克克朗
  DKK: 'kr', // 丹麦克朗
  EUR: '€', // 欧元
  GBP: '£', // 英镑
  GEL: '₾', // 格鲁吉亚拉里
  HKD: '$', // 港元
  HUF: 'Ft', // 匈牙利福林
  IDR: 'Rp', // 印尼卢比
  ILS: '₪', // 以色列新谢克尔
  INR: '₹', // 印度卢比
  JPY: '¥', // 日元
  KRW: '₩', // 韩元
  KWD: 'د.ك', // 科威特第纳尔
  LKR: '₨', // 斯里兰卡卢比
  MMK: 'Ks', // 缅甸元
  MXN: '$', // 墨西哥比索
  MYR: 'RM', // 马来西亚林吉特
  NGN: '₦', // 尼日利亚奈拉
  NOK: 'kr', // 挪威克朗
  NZD: '$', // 新西兰元
  PHP: '₱', // 菲律宾比索
  PKR: '₨', // 巴基斯坦卢比
  PLN: 'zł', // 波兰兹罗提
  RUB: '₽', // 俄罗斯卢布
  SAR: 'ر.س', // 沙特里亚尔
  SEK: 'kr', // 瑞典克朗
  SGD: '$', // 新加坡元
  THB: '฿', // 泰铢
  TRY: '₺', // 土耳其里拉
  TWD: 'NT$', // 新台币
  UAH: '₴', // 乌克兰赫夫尼亚
  VEF: 'Bs.S', // 委内瑞拉玻利瓦尔
  VND: '₫', // 越南盾
  ZAR: 'R', // 南非兰特
  XDR: 'XDR', // 特别提款权
};

export const PRICE_RESOURCE = ['CoinGecko', 'Kraken'];

export const PAID_STATUS = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
};

export const ORDER_STATUS = {
  AllStatus: 'All Status',
  Settled: 'Settled',
  Processing: 'Processing',
  Expired: 'Expired',
  Invalid: 'Invalid',
};

export const INVOICE_SOURCE_TYPE = {
  Invoice: 'Invoice',
  PaymentRequest: 'Payment Request',
  PullPayment: 'PullPayment',
  Payout: 'Payout',
  Sales: 'Sales',
  Wallets: 'Wallets',
};

export const PAYOUT_SOURCE_TYPE = {
  PullPayment: 'PullPayment',
};

export const PAYMENT_REQUEST_STATUS = {
  AllStatus: 'All Status',
  Pending: 'Pending',
  Settled: 'Settled',
  Expired: 'Expired',
  Archived: 'Archived',
};

export const PULL_PAYMENT_STATUS = {
  Active: 'Active',
  Expired: 'Expired',
  Settled: 'Settled',
  Archived: 'Archived',
  Future: 'Future',
};

export const PAYOUT_STATUS = {
  AwaitingApproval: 'Awaiting Approval',
  AwaitingPayment: 'Awaiting Payment',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

export const ORDER_TIME = {
  AllTime: 'All Time',
  Last24Hours: 'Last 24 hours',
  Last3Days: 'Last 3 days',
  Last7Days: 'Last 7 days',
};

export const REPORT_STATUS = {
  All: 'All',
  Invoice: 'Invoice',
  PaymentRequest: 'Payment Request',
  PullPayment: 'PullPayment',
  Payout: 'Payout',
  Sales: 'Sales',
  Wallets: 'Wallets',
};

export const COINGECKO_IDS: { [key in COINS]: string } = {
  [COINS.BTC]: 'bitcoin',
  [COINS.ETH]: 'ethereum',
  [COINS.USDT]: 'tether',
  [COINS.BNB]: 'binancecoin',
  [COINS.SOL]: 'solana',
  [COINS.USDC]: 'usd-coin',
  [COINS.XRP]: 'ripple',
  [COINS.TON]: 'the-open-network',
  [COINS.DOGE]: 'dogecoin',
  [COINS.ADA]: 'cardano',
  [COINS.TRX]: 'tron',
  [COINS.AVAX]: 'avalanche-2',
  [COINS.SHIB]: 'shiba-inu',
  [COINS.DOT]: 'polkadot',
  [COINS.LINK]: 'chainlink',
  [COINS.BCH]: 'bitcoin-cash',
  [COINS.DAI]: 'dai',
  [COINS.LTC]: 'litecoin',
  [COINS.POL]: 'matic-network',
  [COINS.UNI]: 'uniswap',
  [COINS.PEPE]: 'pepe',
  [COINS.FIL]: 'filecoin',
  [COINS.ARB]: 'arbitrum',
  [COINS.OP]: 'optimism',
  [COINS.FDUSD]: 'fdusd',
  [COINS.WIF]: 'wif',
  [COINS.NOT]: 'not',
  [COINS.BONK]: 'bonk',
  [COINS.AAVE]: 'aave',
  [COINS.BGB]: 'bgb',
  [COINS.FLOKI]: 'floki-inu',
  [COINS.JUP]: 'jupiter',
  [COINS.CORE]: 'core',
  [COINS.ENS]: 'ethereum-name-service',
  [COINS.W]: 'wrapped-eth',
  [COINS.CRV]: 'curve-dao-token',
  [COINS.MEW]: 'meow',
  [COINS.ETHFI]: 'ethfi',
  [COINS.BUSD]: 'binance-usd',
  [COINS.WBTC]: 'wrapped-bitcoin',
  [COINS.WETH]: 'wrapped-ether',
  [COINS.WSOL]: 'wrapped-solana',
  [COINS.SAND]: 'sand',
  [COINS.CRO]: 'cro',
};

type Language = {
  code: string;
  name: string;
};

export const LANGUAGES: Language[] = [
  { code: 'aa', name: 'Afar' },
  { code: 'ab', name: 'Abkhazian' },
  { code: 'ae', name: 'Avestan' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'ak', name: 'Akan' },
  { code: 'am', name: 'Amharic' },
  { code: 'an', name: 'Aragonese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'as', name: 'Assamese' },
  { code: 'av', name: 'Avaric' },
  { code: 'ay', name: 'Aymara' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'ba', name: 'Bashkir' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'bh', name: 'Bihari languages' },
  { code: 'bi', name: 'Bislama' },
  { code: 'bm', name: 'Bambara' },
  { code: 'bn', name: 'Bengali' },
  { code: 'bo', name: 'Tibetan' },
  { code: 'br', name: 'Breton' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'ca', name: 'Catalan; Valencian' },
  { code: 'ce', name: 'Chechen' },
  { code: 'ch', name: 'Chamorro' },
  { code: 'co', name: 'Corsican' },
  { code: 'cr', name: 'Cree' },
  { code: 'cs', name: 'Czech' },
  {
    code: 'cu',
    name: 'Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic',
  },
  { code: 'cv', name: 'Chuvash' },
  { code: 'cy', name: 'Welsh' },
  { code: 'da', name: 'Danish' },
  { code: 'de', name: 'German' },
  { code: 'dv', name: 'Divehi; Dhivehi; Maldivian' },
  { code: 'dz', name: 'Dzongkha' },
  { code: 'ee', name: 'Ewe' },
  { code: 'el', name: 'Greek, Modern (1453-)' },
  { code: 'en', name: 'English' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'es', name: 'Spanish; Castilian' },
  { code: 'et', name: 'Estonian' },
  { code: 'eu', name: 'Basque' },
  { code: 'fa', name: 'Persian' },
  { code: 'ff', name: 'Fulah' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fj', name: 'Fijian' },
  { code: 'fo', name: 'Faroese' },
  { code: 'fr', name: 'French' },
  { code: 'fy', name: 'Western Frisian' },
  { code: 'ga', name: 'Irish' },
  { code: 'gd', name: 'Gaelic; Scomttish Gaelic' },
  { code: 'gl', name: 'Galician' },
  { code: 'gn', name: 'Guarani' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'gv', name: 'Manx' },
  { code: 'ha', name: 'Hausa' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ho', name: 'Hiri Motu' },
  { code: 'hr', name: 'Croatian' },
  { code: 'ht', name: 'Haitian; Haitian Creole' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'hy', name: 'Armenian' },
  { code: 'hz', name: 'Herero' },
  {
    code: 'ia',
    name: 'Interlingua (International Auxiliary Language Association)',
  },
  { code: 'id', name: 'Indonesian' },
  { code: 'ie', name: 'Interlingue; Occidental' },
  { code: 'ig', name: 'Igbo' },
  { code: 'ii', name: 'Sichuan Yi; Nuosu' },
  { code: 'ik', name: 'Inupiaq' },
  { code: 'io', name: 'Ido' },
  { code: 'is', name: 'Icelandic' },
  { code: 'it', name: 'Italian' },
  { code: 'iu', name: 'Inuktitut' },
  { code: 'ja', name: 'Japanese' },
  { code: 'jv', name: 'Javanese' },
  { code: 'ka', name: 'Georgian' },
  { code: 'kg', name: 'Kongo' },
  { code: 'ki', name: 'Kikuyu; Gikuyu' },
  { code: 'kj', name: 'Kuanyama; Kwanyama' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'kl', name: 'Kalaallisut; Greenlandic' },
  { code: 'km', name: 'Central Khmer' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ko', name: 'Korean' },
  { code: 'kr', name: 'Kanuri' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'ku', name: 'Kurdish' },
  { code: 'kv', name: 'Komi' },
  { code: 'kw', name: 'Cornish' },
  { code: 'ky', name: 'Kirghiz; Kyrgyz' },
  { code: 'la', name: 'Latin' },
  { code: 'lb', name: 'Luxembourgish; Letzeburgesch' },
  { code: 'lg', name: 'Ganda' },
  { code: 'li', name: 'Limburgan; Limburger; Limburgish' },
  { code: 'ln', name: 'Lingala' },
  { code: 'lo', name: 'Lao' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lu', name: 'Luba-Katanga' },
  { code: 'lv', name: 'Latvian' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'mh', name: 'Marshallese' },
  { code: 'mi', name: 'Maori' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ms', name: 'Malay' },
  { code: 'mt', name: 'Maltese' },
  { code: 'my', name: 'Burmese' },
  { code: 'na', name: 'Nauru' },
  {
    code: 'nb',
    name: 'Bokmål, Norwegian; Norwegian Bokmål',
  },
  { code: 'nd', name: 'Ndebele, North; North Ndebele' },
  { code: 'ne', name: 'Nepali' },
  { code: 'ng', name: 'Ndonga' },
  { code: 'nl', name: 'Dutch; Flemish' },
  { code: 'nn', name: 'Norwegian Nynorsk; Nynorsk, Norwegian' },
  { code: 'no', name: 'Norwegian' },
  { code: 'nr', name: 'Ndebele, South; South Ndebele' },
  { code: 'nv', name: 'Navajo; Navaho' },
  { code: 'ny', name: 'Chichewa; Chewa; Nyanja' },
  { code: 'oc', name: 'Occitan (post 1500)' },
  { code: 'oj', name: 'Ojibwa' },
  { code: 'om', name: 'Oromo' },
  { code: 'or', name: 'Oriya' },
  { code: 'os', name: 'Ossetian; Ossetic' },
  { code: 'pa', name: 'Panjabi; Punjabi' },
  { code: 'pi', name: 'Pali' },
  { code: 'pl', name: 'Polish' },
  { code: 'ps', name: 'Pushto; Pashto' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'qu', name: 'Quechua' },
  { code: 'rm', name: 'Romansh' },
  { code: 'rn', name: 'Rundi' },
  { code: 'ro', name: 'Romanian; Moldavian; Moldovan' },
  { code: 'ru', name: 'Russian' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'sc', name: 'Sardinian' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'se', name: 'Northern Sami' },
  { code: 'sg', name: 'Sango' },
  { code: 'si', name: 'Sinhala; Sinhalese' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'sm', name: 'Samoan' },
  { code: 'sn', name: 'Shona' },
  { code: 'so', name: 'Somali' },
  { code: 'sq', name: 'Albanian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'ss', name: 'Swati' },
  { code: 'st', name: 'Sotho, Southern' },
  { code: 'su', name: 'Sundanese' },
  { code: 'sv', name: 'Swedish' },
  { code: 'sw', name: 'Swahili' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'tg', name: 'Tajik' },
  { code: 'th', name: 'Thai' },
  { code: 'ti', name: 'Tigrinya' },
  { code: 'tk', name: 'Turkmen' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'tn', name: 'Tswana' },
  { code: 'to', name: 'Tonga (Tonga Islands)' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ts', name: 'Tsonga' },
  { code: 'tt', name: 'Tatar' },
  { code: 'tw', name: 'Twi' },
  { code: 'ty', name: 'Tahitian' },
  { code: 'ug', name: 'Uighur; Uyghur' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'uz', name: 'Uzbek' },
  { code: 've', name: 'Venda' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'vo', name: 'Volapük' },
  { code: 'wa', name: 'Walloon' },
  { code: 'wo', name: 'Wolof' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yi', name: 'Yiddish' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'za', name: 'Zhuang; Chuang' },
  { code: 'zh', name: 'Chinese' },
  { code: 'zu', name: 'Zulu' },
];

export type APIKEYPERMISSION = {
  id: number;
  title: string;
  tag: string;
  description: string;
  status?: boolean;
};

export const APIKEYPERMISSIONS: APIKEYPERMISSION[] = [
  {
    id: 1,
    title: 'View invoices',
    tag: 'cryptopay.store.canviewinvoices',
    description: 'Allows viewing invoices on the selected stores.',
  },
  {
    id: 2,
    title: 'Create an invoice',
    tag: 'cryptopay.store.cancreateinvoice',
    description: 'Allows creating new invoices.',
  },
  {
    id: 3,
    title: 'Modify invoices',
    tag: 'cryptopay.store.canmodifyinvoices',
    description: 'Allows viewing and modifying invoices.',
  },
  {
    id: 4,
    title: 'Modify stores webhooks',
    tag: 'cryptopay.store.webhooks.canmodifywebhooks',
    description: 'Allows modifying the webhooks of all your stores.',
  },
  {
    id: 5,
    title: 'Modify your stores',
    tag: 'cryptopay.store.canmodifystoresettings',
    description: 'Allows managing invoices on all your stores and modify their settings.',
  },
  {
    id: 6,
    title: 'View your stores',
    tag: 'cryptopay.store.canviewstoresettings',
    description: 'Allows viewing stores settings.',
  },
  {
    id: 7,
    title: 'View your reports',
    tag: 'cryptopay.store.canviewreports',
    description: 'Allows viewing reports.',
  },
  {
    id: 8,
    title: 'View your payment requests',
    tag: 'cryptopay.store.canviewpaymentrequests',
    description: 'Allows viewing payment requests.',
  },

  {
    id: 9,
    title: 'Modify your payment requests',
    tag: 'cryptopay.store.canmodifypaymentrequests',
    description: 'Allows viewing, modifying, deleting and creating new payment requests on all your stores.',
  },
  {
    id: 10,
    title: 'Manage your profile',
    tag: 'cryptopay.user.canmodifyprofile',
    description: 'Allows viewing and modifying your user profile.',
  },
  {
    id: 11,
    title: 'View your profile',
    tag: 'cryptopay.store.canviewinvoices',
    description: 'Allows viewing invoices on the selected stores.',
  },
  {
    id: 12,
    title: 'View invoices',
    tag: 'cryptopay.user.canviewprofile',
    description: 'Allows viewing your user profile.',
  },
  {
    id: 13,
    title: 'Delete user',
    tag: 'cryptopay.user.candeleteuser',
    description:
      'Allows deleting the user to whom it is assigned. Admin users can delete any user without this permission.',
  },
  {
    id: 14,
    title: 'Manage your notifications',
    tag: 'cryptopay.user.canmanagenotificationsforuser',
    description: 'Allows viewing and modifying your user notifications.',
  },
  {
    id: 15,
    title: 'View your notifications',
    tag: 'cryptopay.user.canviewnotificationsforuser',
    description: 'Allows viewing your user notifications.',
  },
  {
    id: 16,
    title: 'Unrestricted access',
    tag: 'unrestricted',
    description: 'Grants unrestricted access to your account.',
  },
  {
    id: 17,
    title: 'Manage your pull payments',
    tag: 'cryptopay.store.canmanagepullpayments',
    description: 'Allows viewing, modifying, deleting and creating pull payments on all your stores.',
  },
  {
    id: 18,
    title: 'Archive your pull payments',
    tag: 'cryptopay.store.canarchivepullpayments',
    description: 'Allows deleting pull payments on all your stores.',
  },
  {
    id: 19,
    title: 'Create pull payments',
    tag: 'cryptopay.store.cancreatepullpayments',
    description: 'Allows creating pull payments on all your stores.',
  },
  {
    id: 20,
    title: 'View your pull payments',
    tag: 'cryptopay.store.canviewpullpayments',
    description: 'Allows viewing pull payments on all your stores.',
  },
  {
    id: 21,
    title: 'Create non-approved pull payments',
    tag: 'cryptopay.store.cancreatenonapprovedpullpayments',
    description: 'Allows creating pull payments without automatic approval on all your stores.',
  },
  {
    id: 22,
    title: 'Manage payouts',
    tag: 'cryptopay.store.canmanagepayouts',
    description: 'Allows managing payouts on all your stores.',
  },
  {
    id: 23,
    title: 'View payouts',
    tag: 'cryptopay.store.canviewpayouts',
    description: 'Allows viewing payouts on all your stores.',
  },
];

export const REQUEST_CUSTOMER_DATA = [
  'Do not request any information',
  'Request email address only',
  'Request shipping address',
];

export const WALLET = ['Binance', 'Coinbase', 'OKX', 'Other'];

export const FILE_TYPE = {
  Image: 'Image',
  Document: 'Document',
  Audio: 'Audio',
  Video: 'Video',
  Compressed: 'Compressed',
  Dev: 'Dev',
  Other: 'Other',
};
