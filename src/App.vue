<script setup lang="ts">
  import ColorPicker from './components/ColorPicker/index.vue';
  import { ref, watch } from 'vue';
  const colorRef = ref('#FFFF00');
  const pickerRef = ref();
  const formatRef = ref('rgba');
  const list = ['hsl', 'rgb', 'rgba', 'hex'];
  watch(
    () => colorRef.value,
    () => {
      console.log(pickerRef.value.colorSet);
    }
  );
</script>

<template>
  <div>
    <div class="format-list">
      <span
        v-for="it in list"
        @click="formatRef = it"
        :class="[formatRef == it ? 'active' : '']"
        :key="it"
        >{{ it }}
      </span>
    </div>

    <ColorPicker v-model="colorRef" ref="pickerRef" :format="formatRef"></ColorPicker>
    <div :style="{ background: colorRef, height: '100px', width: '100px', margin: '30px' }"></div>
  </div>
</template>

<style scoped lang="scss">
  .format-list > span {
    display: inline-block;
    height: 40px;
    width: 70px;
    line-height: 40px;
    color: #ccc;
    cursor: pointer;
    &:not(:last-child) {
      margin-right: 10px;
    }
    &.active {
      color: dodgerblue;
    }
  }
</style>
