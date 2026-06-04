/** Sessiz gif penceresi: ekranda max 0,8 sn, boşluk max 0,7 sn, genelde 2 gif */
export const SILENT_GIF_ON_SCREEN_MS = 800;
export const SILENT_MAX_EMPTY_MS = 700;
export const SILENT_TRACK_STAGGER_MS = 400;
export const SILENT_TRACK_INTERVAL_MS = SILENT_GIF_ON_SCREEN_MS;

/** Kombine pencere (sesli + sessiz gif birlikte) */
export const GIF_ON_SCREEN_MS = 8_000;
export const MAX_EMPTY_MS = 800;
export const GIF_START_INTERVAL_MS = GIF_ON_SCREEN_MS - MAX_EMPTY_MS;
export const COMBINED_MAX_EMPTY_MS = MAX_EMPTY_MS;
export const COMBINED_START_INTERVAL_MS = GIF_ON_SCREEN_MS - COMBINED_MAX_EMPTY_MS;
export const COMBINED_SOUND_STAGGER_MS = 400;
