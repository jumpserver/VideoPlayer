// @ts-ignore
import untar from 'js-untar';
import { gunzipSync } from 'fflate';
import { createDiscreteApi, darkTheme } from 'naive-ui';

import type { UploadFileInfo } from 'naive-ui';
import type { IExtractedFiles } from '@/hooks/interface';

const { notification, message } = createDiscreteApi(['notification', 'message'], {
  configProviderProps: {
    theme: darkTheme
  }
});

/**
 * 处理 Reader onLoad 事件
 */
const handleFileOnLoad = (e: ProgressEvent<FileReader>, fileName: string) => {
  return new Promise((resolve, reject) => {
    if (!e.target?.result) {
      // todo)) 提示信息修改
      notification.error({
        content: 'Error',
        meta: 'Failed to read file',
        duration: 2500,
        keepAliveOnHover: true
      });

      reject();
    }

    let jsonFile: string;
    let videoUrl: string;

    const bufferData: ArrayBuffer = e.target?.result as ArrayBuffer;
    const uint8Array = new Uint8Array(bufferData);

    if (fileName.includes('.tar')) {
      untar(bufferData)
        .progress(() => {})
        .then((extractedFiles: IExtractedFiles[]) => {
          extractedFiles.forEach((extractedFile: IExtractedFiles) => {
            if (extractedFile.name.includes('.json')) {
              const decoder = new TextDecoder('utf-8');

              jsonFile = JSON.parse(decoder.decode(new Uint8Array(extractedFile.buffer)));
            }

            if (extractedFile.name.includes('.mp4')) {
              const videoBuffer: Uint8Array = new Uint8Array(extractedFile.buffer);
              const videoBlob: Blob = new Blob([videoBuffer], { type: 'video/mp4' });

              videoUrl = URL.createObjectURL(videoBlob);
            }
          });

          resolve({
            jsonFile,
            videoUrl
          });
        });
    }

    if (fileName.includes('.zip')) {
    }

    if (fileName.includes('.gz')) {
      const gz = gunzipSync(uint8Array);

      console.log(gz);
    }

    // notification.error({
    //   content: '录像文件错误',
    //   duration: 2500,
    //   keepAliveOnHover: true
    // });
  });
};

/**
 * 解析不同类型的文件
 *
 * @param fileInfo
 */
const fileParser = (fileInfo: UploadFileInfo): Promise<any> => {
  return new Promise((resolve, reject) => {
    const file: File = fileInfo.file!;
    const fileName: string = fileInfo.name;
    const fileReader = new FileReader();

    fileReader.readAsArrayBuffer(file);

    fileReader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const res = await handleFileOnLoad(e, fileName);

        resolve(res);
      } catch (e) {
        message.error(`Error parsing file: ${e}`);
      }
    };

    fileReader.onerror = () => {
      notification.error({
        content: 'Error reading file',
        duration: 2500,
        keepAliveOnHover: true
      });
      reject();
    };
  });
};

/**
 * 用于解析压缩文件
 */
export const useResolveFile = () => {
  return {
    fileParser
  };
};
