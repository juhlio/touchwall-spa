/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_MAP_TILE_URL: string
  readonly VITE_MAP_DEFAULT_LAT: string
  readonly VITE_MAP_DEFAULT_LNG: string
  readonly VITE_MAP_DEFAULT_ZOOM: string
  readonly VITE_IDLE_TIMEOUT_MS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
