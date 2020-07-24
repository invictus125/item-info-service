export interface IPathConfiguration {
  path: string;
  getCallback: Function;
  putCallback?: Function;
};

export interface IServerConfiguration {
  port: number;
  paths: Array<IPathConfiguration>;
};
