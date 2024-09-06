export interface IVideoList {
  name: string;

  type: string;

  jsonFile: string;

  videoUrl: string;
}

export interface IFile {
  videoList: Array<IVideoList>;
}
