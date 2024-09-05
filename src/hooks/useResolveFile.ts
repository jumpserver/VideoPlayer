import { gunzipSync } from 'fflate';
import { createDiscreteApi, darkTheme } from 'naive-ui';

import type { UploadFileInfo } from 'naive-ui';

//! Start
const { notification } = createDiscreteApi(['notification'], {
  configProviderProps: {
    theme: darkTheme
  }
});

/**
 * 用于解析压缩文件
 */
export const useResolveFile = () => {
  const fileParser = (fileInfo: UploadFileInfo) => {
    const file: File = fileInfo.file!;
    const fileName: string = fileInfo.name;

    const fileReader = new FileReader();

    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target?.result) {
        // todo)) 提示信息修改
        return notification.error({
          content: 'Error',
          meta: 'Failed to read file',
          duration: 2500,
          keepAliveOnHover: true
        });
      }

      const bufferData: ArrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(bufferData);

      if (fileName.includes('.tar')) {
        console.log(fileInfo);

        return;
      }

      if (fileName.includes('.zip')) {
        return;
      }

      if (fileName.includes('.gz')) {
        const gz = gunzipSync(uint8Array);

        console.log(gz);
        return;
      }
    };
  };

  return {
    fileParser
  };
};
