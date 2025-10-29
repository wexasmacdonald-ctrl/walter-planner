import { z } from 'zod';

export const PROVINCES = [
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
] as const;

export const addressPattern =
  /^.+,\s*[A-Za-z .'-]+,\s*(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT),\s*Canada$/;

export const AddressLineSchema = z
  .string()
  .trim()
  .regex(addressPattern, "Use: '123 Main St, City, ON, Canada'");

const CANADA_SUFFIX = ', Canada';

export const normalizeAddressLine = (raw: string) => {
  if (!raw) {
    return '';
  }

  let value = raw.trim().replace(/\s+/g, ' ');

  if (!value.toLowerCase().endsWith('canada')) {
    value = value.replace(/,?\s*$/u, '');
    value = `${value}${CANADA_SUFFIX}`;
  }

  const segments = value
    .split(',')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const [street = '', city = '', province = '', country = 'Canada'] = [
    segments[0],
    segments[1],
    segments[2],
    'Canada',
  ];

  const normalizedProvince =
    province.length === 2
      ? province.toUpperCase()
      : province.replace(
          /\b([A-Za-z]{2})\b/u,
          (match) => match.toUpperCase()
        );

  return `${street}, ${city}, ${normalizedProvince}, ${country}`;
};

export const formatAddressLine = (addressLine: string) => addressLine;
