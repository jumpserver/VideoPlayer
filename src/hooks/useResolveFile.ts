// @ts-ignore
import untar from 'js-untar';
import { gunzipSync } from 'fflate';
import { createDiscreteApi, darkTheme } from 'naive-ui';
import { useFileStore } from '@/store/modules/fileStore.ts';

import type { UploadFileInfo } from 'naive-ui';
import type { IExtractedFiles } from '@/hooks/interface';

const { notification, message } = createDiscreteApi(['notification', 'message'], {
  configProviderProps: { theme: darkTheme }
});

interface IFileParser {
  onFinish: () => void;
  onError: () => void;
  onProgress: (e: { percent: number }) => void;
}

/** 安全 JSON 解析：失败返回 null，不抛错 */
const safeParseJson = (buf: ArrayBuffer): Record<string, unknown> | null => {
  try {
    const text = new TextDecoder('utf-8').decode(new Uint8Array(buf));
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
};

/**
 * 处理 Gua 的数据流（写磁盘/返回本地路径）
 */
const handleGuaData = (
  buffer: ArrayBuffer,
  fileName: string,
  eventOptions: IFileParser
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      window.electron
        .writeFile(buffer, fileName)
        .then((filePath: string) => {
          eventOptions.onFinish();
          resolve(filePath);
        })
        .catch((err: unknown) => {
          eventOptions.onError();
          notification.error({
            title: 'Error',
            content: String(err).split(':')[1] ?? String(err),
            duration: 5000,
            keepAliveOnHover: true
          });
          reject(err);
        });
    } catch (e) {
      // 这里不 reject，避免打断后续逻辑
      console.error(e);
      eventOptions.onError();
      notification.error({
        title: 'Error',
        content: 'Unexpected error when writing file',
        duration: 5000,
        keepAliveOnHover: true
      });
      reject(e);
    }
  });
};

/**
 * 处理 FileReader onLoad
 */
const handleFileOnLoad = (
  e: ProgressEvent<FileReader>,
  fileName: string,
  eventOptions: IFileParser
) => {
  const fileStore = useFileStore();

  return new Promise(async (resolve, reject) => {
    if (!e.target?.result) {
      notification.error({
        content: 'Error',
        meta: 'Failed to read file',
        duration: 2500,
        keepAliveOnHover: true
      });
      return reject();
    }

    let type = '';
    let videoUrl = '';
    let jsonFile: Record<string, unknown> | null = null;

    const bufferData: ArrayBuffer = e.target.result as ArrayBuffer;
    // 注意：第二个 'binary' 参数是无效的，这里要去掉
    const uint8Array = new Uint8Array(bufferData);
    const regExp = /\.(json|replay|cast|part)(\.mp4|\.json|\.gz)?$/;

    /** -------------------- 处理 .tar -------------------- */
    if (fileName.includes('.tar')) {
      try {
        const extractedFiles: IExtractedFiles[] = await untar(bufferData).progress(() => {});

        for (const extractedFile of extractedFiles) {
          const match = extractedFile.name.match(regExp);
          const partJson: string = match?.[0] ?? '';
          const decompressFileName: string = match?.[1] ?? '';

          // part 的 JSON：xxx.replay.json
          if (partJson === '.replay.json') {
            jsonFile = safeParseJson(extractedFile.buffer) ?? jsonFile;
          }

          switch (decompressFileName) {
            case 'json': {
              jsonFile = safeParseJson(extractedFile.buffer) ?? jsonFile;
              break;
            }
            case 'replay': {
              const isGua = extractedFile.name.split('.')[2] === 'gz';
              if (isGua) {
                type = 'gua';
                try {
                  const res = await handleGuaData(
                    extractedFile.buffer,
                    extractedFile.name,
                    eventOptions
                  );
                  if (res) videoUrl = res;
                } catch {
                  // 已在 handleGuaData 内处理错误，这里不中断
                }
                break;
              }

              type = 'mp4';
              const videoBuffer: Uint8Array = new Uint8Array(extractedFile.buffer);
              const videoBlob: Blob = new Blob([videoBuffer], { type: 'video/mp4' });
              videoUrl = URL.createObjectURL(videoBlob);
              break;
            }
            case 'cast': {
              type = 'cast';
              try {
                const decompressedData: Uint8Array = gunzipSync(
                  new Uint8Array(extractedFile.buffer)
                );
                const blob = new Blob([decompressedData], { type: 'application/octet-stream' });
                videoUrl = URL.createObjectURL(blob);
              } catch (error) {
                message.error(`Failed to decompress .gz file: ${error}`);
                // 不 reject，为了让其它文件继续处理
              }
              break;
            }
            case 'part': {
              type = 'part';
              try {
                const res = await handleGuaData(
                  extractedFile.buffer,
                  extractedFile.name,
                  eventOptions
                );
                if (res) {
                  videoUrl = res;
                  fileStore.setVideoList({
                    type,
                    jsonFile: jsonFile ?? {},
                    videoUrl,
                    name: extractedFile.name
                  });
                }
              } catch {
                // handleGuaData 已处理错误
              }
              break;
            }
            default:
              // 其他文件跳过
              break;
          }
        }

        // 非 part 的情况，统一入库一次
        if (type !== 'part') {
          fileStore.setVideoList({
            type,
            jsonFile: jsonFile ?? {},
            videoUrl,
            name: fileName.split('.')[0]
          });
        }

        return resolve({ jsonFile, videoUrl });
      } catch (err) {
        eventOptions.onError();
        message.error(`Error parsing tar: ${err}`);
        return reject(err);
      }
    }

    /** -------------------- 处理 .gz -------------------- */
    if (fileName.includes('.gz')) {
      // @ts-ignore
      const processName = fileName.match(regExp)?.[1];

      switch (processName) {
        case 'replay': {
          const isGua = fileName.split('.')[2] === 'gz';
          if (isGua) {
            type = 'gua';
            try {
              const res = await handleGuaData(
                e.currentTarget?.result as ArrayBuffer,
                fileName,
                eventOptions
              );
              if (res) videoUrl = res;
            } catch {
              // 已在 handleGuaData 内处理
            }
          }
          break;
        }

        case 'cast': {
          type = 'cast';
          try {
            const decompressedData: Uint8Array = gunzipSync(
              new Uint8Array(e.currentTarget?.result as ArrayBuffer)
            );
            const blob = new Blob([decompressedData], { type: 'application/octet-stream' });
            videoUrl = URL.createObjectURL(blob);
          } catch (error) {
            eventOptions.onError();
            message.error(`Failed to decompress .gz file: ${error}`);
            // 不 reject，以便调用方能拿到 onError 回调后继续
          }
          break;
        }

        case 'part': {
          type = 'part';
          try {
            const res = await handleGuaData(
              e.currentTarget?.result as ArrayBuffer,
              fileName,
              eventOptions
            );
            if (res) videoUrl = res;
          } catch {
            // 已在 handleGuaData 内处理
          }
          break;
        }

        // 未来如果有 json.gz，这里可加：
        // case 'json': { jsonFile = safeParseJson(gunzipSync(...).buffer) ?? jsonFile; break; }
        default:
          break;
      }

      fileStore.setVideoList({
        type,
        jsonFile: jsonFile ?? {},
        videoUrl,
        name: fileName.split('.')[0]
      });

      return resolve({ jsonFile, videoUrl });
    }

    /** -------------------- 处理 .mp4 -------------------- */
    if (fileName.includes('.mp4')) {
      type = 'mp4';
      const videoBuffer: Uint8Array = new Uint8Array(e.currentTarget?.result as ArrayBuffer);
      const videoBlob: Blob = new Blob([videoBuffer], { type: 'video/mp4' });
      videoUrl = URL.createObjectURL(videoBlob);

      fileStore.setVideoList({
        type,
        jsonFile: jsonFile ?? {},
        videoUrl,
        name: fileName.split('.')[0]
      });

      return resolve({ jsonFile, videoUrl });
    }

    /** -------------------- 其他格式兜底 -------------------- */
    // 未识别格式也不报错，按“无视频，仅 JSON 可能为空”处理
    fileStore.setVideoList({
      type,
      jsonFile: jsonFile ?? {},
      videoUrl,
      name: fileName.split('.')[0]
    });
    return resolve({ jsonFile, videoUrl });
  });
};

/**
 * 解析不同类型的文件
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
        const res = await handleFileOnLoad(e, fileName, eventOptions);
        // 不管有没有 JSON，都触发 onFinish（延时与原逻辑一致）
        setTimeout(() => eventOptions.onFinish(), 300);
        resolve(res);
      } catch (err) {
        eventOptions.onError();
        message.error(`Error parsing file: ${err}`);
        reject(err);
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
  return { fileParser };
};
