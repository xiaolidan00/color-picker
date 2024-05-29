<script setup lang="ts">
  import ColorPicker from './components/ColorPicker/index.vue';
  import { ref, watch } from 'vue';
  const colorRef = ref('#FFFF00');
  const pickerRef = ref();
  watch(
    () => colorRef.value,
    () => {
      console.log(pickerRef.value.colorSet);
    }
  );
</script>

<template>
  <div>
    <ColorPicker v-model="colorRef" ref="pickerRef"></ColorPicker>
    <div :style="{ background: colorRef, height: '100px', width: '100px', margin: '30px' }"></div>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }
</style>
