import { defineStore } from 'pinia';

import type { IFile, IVideoList } from '@/store/interface';
import { createDiscreteApi, darkTheme } from 'naive-ui';

const { message } = createDiscreteApi(['message'], {
  configProviderProps: {
    theme: darkTheme
  }
});

export const useFileStore = defineStore('file', {
  state: (): IFile => ({
    videoList: []
  }),
  actions: {
    setVideoList(listItem: IVideoList) {
      if (this.videoList.length === 0) {
        return this.videoList.push(listItem);
      }

      this.videoList.map((list: IVideoList) => {
        if (list.name === listItem.name) {
          message.info('您已经提交过该文件，请到列表中查看！');
          return;
        }

        this.videoList.push(listItem);
      });
    },
    removeListItem(name: string) {
      this.videoList = this.videoList.filter((list: IVideoList) => list.name !== name);
    }
  }
});
