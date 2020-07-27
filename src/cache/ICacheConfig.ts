export interface ICacheConfig {
  maxItems: number;
  recordLifetimeMs: number;
  cleanPeriodMs: number;
  syncPeriodMs: number;
  itemSyncCallback?: Function;
}
