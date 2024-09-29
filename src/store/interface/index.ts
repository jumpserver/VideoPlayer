export interface IVideoList {
  name: string;

  type: string;

  jsonFile: object;

  videoUrl: string;
}

export interface IFile {
  videoList: Array<IVideoList>;
}

export type ThemeType = 'light' | 'dark';

export interface ISetting {
  theme: ThemeType;
}
