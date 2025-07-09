export const PLACEHOLDER_PICTURE = 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg';

export const DEFAULT_CURRENCY = 'UGX';

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
};

export const VERIFICATION_STATUSES = {
  VERIFIED: 'verified',
  RED_FLAG: 'red_flag',
  PENDING: 'pending',
};

export const GENDERS = ['Male', 'Female', 'Non-Binary', 'Other'];
export const SEXUAL_ORIENTATIONS = ['Heterosexual', 'Homosexual', 'Bisexual', 'Pansexual', 'Asexual', 'Other'];

export const INTEREST_CATEGORIES = [
  'Music',
  'Travel',
  'Photography',
  'Gaming',
  'Fashion',
  'Fitness',
  'Food',
  'Books',
  'Movies',
  'Art',
  'Tech',
  'Business',
  'Spirituality',
  'Politics',
  'Volunteering',
];

export const MAX_BIO_LENGTH = 300;

export const API_ENDPOINTS = {
  UPDATE_PROFILE: '/api/user/update',
  GET_PROFILE: '/api/user/profile',
  UPLOAD_AVATAR: '/api/user/avatar',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};
