/**
 * Shared validation constants across the application.
 */

// Length Constraints
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;

export const FULL_NAME_MIN_LENGTH = 2;
export const FULL_NAME_MAX_LENGTH = 100;

export const PASSWORD_MIN_LENGTH = 8;

export const PHONE_MIN_LENGTH = 10;
export const PHONE_MAX_LENGTH = 15;

export const ADDRESS_LINE_MIN_LENGTH = 5;
export const ADDRESS_LINE_MAX_LENGTH = 200;

export const CITY_MIN_LENGTH = 2;
export const CITY_MAX_LENGTH = 100;

export const STATE_MIN_LENGTH = 2;
export const STATE_MAX_LENGTH = 100;

export const COUNTRY_MIN_LENGTH = 2;
export const COUNTRY_MAX_LENGTH = 100;

export const POSTAL_CODE_MIN_LENGTH = 3;
export const POSTAL_CODE_MAX_LENGTH = 15;

export const LATITUDE_MIN = -90;
export const LATITUDE_MAX = 90;

export const LONGITUDE_MIN = -180;
export const LONGITUDE_MAX = 180;

// Regular Expressions
export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
export const PHONE_REGEX = /^[0-9+\-\s()]+$/;
export const MOBILE_PHONE_REGEX = /^\d{10}$/;
export const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]+$/;
