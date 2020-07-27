import { IPriceRecord } from './IPriceRecord';

/**
 * Defines the minimum interface for a Prices Store to be used by this
 * service.  Implementations are free to choose how and where to access the
 * database so long as the functions operate in this manner.
 *
 * This allows for a local database, or a remote service to be used.
 */
export default abstract class PricesStore {
  public abstract create(record: IPriceRecord): Promise<IPriceRecord>;

  public abstract read(field: string, val: any): Promise<Array<IPriceRecord>>;

  public abstract update(record: IPriceRecord): Promise<number>;
}
