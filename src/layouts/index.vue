<template>
  <n-layout font="sans" h-screen class="w-[calc(100vw-65px)]">
    <n-layout-header h-75px bordered class="bg-[#17181A] border-[#232527]">
      <Header />
    </n-layout-header>
    <n-layout-content w-full class="bg-[#17181A] h-[calc(100%-75px)]">
      <n-grid x-gap="12" :cols="2" h-full>
        <n-gi>
          <n-flex h-full justify="center" align="center">
            <Upload />
          </n-flex>
        </n-gi>
      </n-grid>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import Header from '@/layouts/Header/index.vue';
import Upload from './Content/Upload/index.vue';
</script>

<style scoped></style>
