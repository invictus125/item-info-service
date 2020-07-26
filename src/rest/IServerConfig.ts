export interface IPathConfig {
  path: string;
  getCallback: Function;
  putCallback?: Function;
};

export interface IServerConfig {
  port: number;
  paths?: Array<IPathConfig>;
};
