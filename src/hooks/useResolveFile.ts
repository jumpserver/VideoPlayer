// @ts-ignore
import untar from 'js-untar';
import { gunzipSync } from 'fflate';
import type { UploadFileInfo } from 'naive-ui';
import { createDiscreteApi, darkTheme } from 'naive-ui';
import type { IExtractedFiles } from '@/hooks/interface';
import { useFileStore } from '@/store/modules/fileStore.ts';

const { notification, message } = createDiscreteApi(['notification', 'message'], {
  configProviderProps: {
    theme: darkTheme
  }
});

interface IFileParser {
  onFinish: () => void;
  onError: () => void;
  onProgress: (e: { percent: number }) => void;
}

/**
 * 处理 Reader onLoad 事件
 */
const handleFileOnLoad = (e: ProgressEvent<FileReader>, fileName: string) => {
  const fileStore = useFileStore();

  return new Promise((resolve, reject) => {
    if (!e.target?.result) {
      notification.error({
        content: 'Error',
        meta: 'Failed to read file',
        duration: 2500,
        keepAliveOnHover: true
      });

      reject();
    }

    let type: string;
    let jsonFile: string;
    let videoUrl: string;

    const bufferData: ArrayBuffer = e.target?.result as ArrayBuffer;
    // @ts-ignore
    const uint8Array = new Uint8Array(bufferData);

    if (fileName.includes('.tar')) {
      untar(bufferData)
        .progress(() => {})
        .then((extractedFiles: IExtractedFiles[]) => {
          for (const extractedFile of extractedFiles) {
            const decompressFileName: string = extractedFile.name.split('.')[1];

            switch (decompressFileName) {
              case 'json': {
                const decoder = new TextDecoder('utf-8');

                jsonFile = JSON.parse(decoder.decode(new Uint8Array(extractedFile.buffer)));

                break;
              }
              case 'replay': {
                type = 'mp4';
                const videoBuffer: Uint8Array = new Uint8Array(extractedFile.buffer);
                const videoBlob: Blob = new Blob([videoBuffer], { type: 'video/mp4' });

                videoUrl = URL.createObjectURL(videoBlob);

                break;
              }
              case 'cast': {
                type = 'cast';
                try {
                  const decompressedData = gunzipSync(new Uint8Array(extractedFile.buffer));

                  const binaryString: string = Array.from(decompressedData)
                    .map(byte => String.fromCharCode(byte))
                    .join('');

                  // btoa 只接受字符串输入，因此需要将解压的 Uint8Array 数据转为字符
                  videoUrl = btoa(binaryString);
                } catch (error) {
                  message.error(`Failed to decompress .gz file: ${error}`);
                  reject(error);
                  return;
                }
                break;
              }
            }
          }

          fileStore.setVideoList({
            type,
            jsonFile,
            videoUrl,
            name: fileName.split('.')[0]
          });

          resolve({
            jsonFile,
            videoUrl
          });
        });
    }
  });
};

/**
 * 解析不同类型的文件
 *
 * @param fileInfo
 * @param eventOptions
 */
const fileParser = (fileInfo: UploadFileInfo, eventOptions: IFileParser): Promise<any> => {
  return new Promise((resolve, reject) => {
    const file: File = fileInfo.file!;
    const fileName: string = fileInfo.name;
    const fileReader = new FileReader();

    fileReader.readAsArrayBuffer(file);

    fileReader.onprogress = (e: ProgressEvent<FileReader>) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);

        eventOptions.onProgress({ percent: percentComplete });
      }
    };

    fileReader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const res = await handleFileOnLoad(e, fileName);

        setTimeout(() => {
          eventOptions.onFinish();
        }, 300);

        resolve(res);
      } catch (e) {
        eventOptions.onError();
        message.error(`Error parsing file: ${e}`);
      }
    };

    fileReader.onerror = () => {
      eventOptions.onError();
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
