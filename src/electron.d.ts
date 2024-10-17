interface Window {
  electron: {
    Buffer: typeof Buffer;
    stopReading: () => void;
    unLinkFile: (filePath: string) => Promise<boolean>;
    writeFile: (arrayBuffer: ArrayBuffer, fileName: string) => Promise<string>;
    readFile: (filePath: string) => Promise<ArrayBuffer>;
    onFileDataChunk: (callback: (event: any, chunk: any) => void) => void;
    onFileDataEnd: (callback: (event: any, message: string) => void) => void;
    onFileDataError: (callback: (event: any, errorMessage: string) => void) => void;
  };
}
