export interface ICacheConfig {
  disabled: boolean;
  maxItems: number;
  recordLifetimeMs: number;
  cleanPeriodMs: number;
  syncPeriodMs: number;
  itemSyncCallback?: Function;
}
