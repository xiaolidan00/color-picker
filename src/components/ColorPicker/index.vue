<template>
  <div class="color-picker">
    <canvas class="temp-canvas" ref="tempRef" height="1" width="1"></canvas>
    <div class="color-picker-container">
      <div class="color-panel">
        <canvas ref="panelRef"></canvas>

        <span
          class="color-panel-thumb"
          :style="{ top: state.panelY + 'px', left: state.panelX + 'px', background: state.color }"
        ></span>
      </div>
      <div class="color-bar">
        <canvas ref="barRef"></canvas>
        <span
          class="color-thumb"
          :style="{ top: state.barY + 'px', background: state.bgColor }"
        ></span>
      </div>
    </div>
    <div class="color-alpha">
      <div
        class="color-alpha-bar"
        ref="alphaRef"
        :style="{
          background: `linear-gradient(to right,  ${resultColor.rgb}  0.1%, rgba(${resultColor.num}, 0) 99.9%)`
        }"
      ></div>
      <span
        class="color-alpha-thumb"
        :style="{ left: state.alphaX + 'px', background: resultColor.rgba }"
      ></span>
    </div>

    <div class="color-gradient">
      <span
        :class="[state.activeGrd === i ? 'active' : '']"
        v-for="(item, i) in state.colorGradients"
        :key="i"
        :style="{ backgroundColor: item.rgb }"
        @click="onGrdColor(i)"
      ></span>
    </div>
    <div class="color-picker-footer">
      <span class="color-span">
        <div :style="{ backgroundColor: resultColor.rgba }"></div>
      </span>
      <img
        src="./diguan.svg"
        :class="['color-picker-dropper', state.isDropper ? 'active' : '']"
        @click="onDropper()"
      />
      <input :value="state.color" class="color-picker-input" @change="onInputColor" />
    </div>
    <div class="color-list">
      <span
        class="color-span"
        v-for="(item, i) in colorList"
        :key="i"
        :style="{ background: item }"
        @click="parseColor(item)"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, onBeforeUnmount, nextTick, computed, watch } from 'vue';
  import { onDragMove } from './DragMove';
  import { rgb2hsv, getRgba } from './color';
  const emit = defineEmits(['update:modelValue', 'change']);
  interface Props {
    modelValue: string;
    colors?: string[];
  }
  const props = withDefaults(defineProps<Props>(), {
    modelValue: 'rgba(255,0,0,1)',
    labels: () => [
      '#3E8ADF',
      '#43ABDD',
      '#4EBD98',
      '#8AD57E',
      '#FBD43E',
      '#F3AE6D',
      '#EF7F6B',
      '#DE6D91',
      '#B064B8',
      '#757ED6'
    ]
  });

  const barRef = ref<HTMLCanvasElement>();

  const panelRef = ref<HTMLCanvasElement>();
  const alphaRef = ref<HTMLElement>();
  let barImgData: Uint8ClampedArray;
  let panelImgData: Uint8ClampedArray;
  let panelWidthPx = 0;
  let isLock = false;
  const tempRef = ref<HTMLCanvasElement>();
  interface StateInterface {
    barY: number;
    alphaX: number;
    color: string;
    panelX: number;
    panelY: number;
    bgColor: string;
    colorSet: { r: number; g: number; b: number; a: number };
    colorGradients: Array<{ r: number; g: number; b: number; rgb: string }>;
    activeGrd: number;
    isDropper: boolean;
  }
  const state = reactive<StateInterface>({
    barY: 0,
    alphaX: 0,
    color: '#FF0000',
    panelX: 0,
    panelY: 0,
    bgColor: '#FF0000',
    colorSet: { r: 255, g: 0, b: 0, a: 1 },
    colorGradients: [],
    activeGrd: 0,
    isDropper: false
  });
  defineExpose({ colorSet: state.colorSet });
  watch(
    () => state.color,
    (val: string) => {
      if (val) {
        emit('update:modelValue', val);
        emit('change', val);
      }
    }
  );
  watch(
    () => props.modelValue,
    (v) => {
      if (v != state.color) parseColor();
    }
  );
  const colorList = computed((): string[] => {
    if (props.colors?.length) return props.colors.slice(0, 10);
    return [];
  });
  const resultColor = computed(() => {
    const s = state.colorSet;
    const num = `${s.r},${s.g},${s.b}`;
    return { rgba: `rgba(${num},${s.a})`, rgb: `rgb(${num})`, num };
  });

  interface DataColor {
    color: string;
    r: number;
    g: number;
    b: number;
  }
  const getImageDataColor = (imgData: Uint8ClampedArray, i: number): DataColor | undefined => {
    if (i >= 0 && i <= imgData.length - 5) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const color = `rgb(${r},${g},${b})`;

      return {
        color,
        r,
        g,
        b
      };
    }
  };
  const onBarMove = (ev: MouseEvent) => {
    const canvas = barRef.value;
    if (canvas) {
      let y = ev.offsetY;
      if (y < 0) {
        y = 0;
      } else if (y > canvas.height) {
        y = canvas.height;
      }
      state.barY = y;
      const i = y * 4;
      const res = getImageDataColor(barImgData, i);
      if (res) {
        const { color } = res;
        console.log(`%c color`, 'background:' + color, color);
        state.bgColor = color;
        if (!isLock) {
          isLock = true;
          nextTick(() => {
            createPanel();
            getPanelColor();
            isLock = false;
          });
        }
      }
    }
  };
  const dragmoveBar = onDragMove({
    start: onBarMove,
    move: onBarMove,
    end: onBarMove
  });
  const getPanelColor = () => {
    const x = state.panelX,
      y = state.panelY;
    const i = (y <= 1 ? 0 : (y - 1) * panelWidthPx) + x * 4;
    const res = getImageDataColor(panelImgData, i);
    if (res) {
      const { color, r, g, b } = res;

      console.log(`%c color`, 'background:' + color, color);
      state.colorSet.r = r;
      state.colorSet.g = g;
      state.colorSet.b = b;
      state.color = `rgba(${r},${g},${b},${state.colorSet.a})`;
      getGradients(r, g, b);
    }
  };
  const getGradients = (r: number, g: number, b: number) => {
    let { h, s } = rgb2hsv(r, g, b);
    h = Math.floor(h);
    s = Math.floor(s);
    if (tempRef.value) {
      const ctx = tempRef.value.getContext('2d');
      if (ctx) {
        const grdList = [];
        const len = 11;
        let minDist = 255 * 3;
        let idx = 0;
        for (let i = 0; i <= len; i++) {
          const c = `hsl(${h}deg,${s}%,${Math.floor((i / len) * 100)}%)`;
          ctx.fillStyle = c;
          ctx.fillRect(0, 0, 1, 1);
          const imgData = ctx.getImageData(0, 0, 1, 1).data;
          const item = {
            r: imgData[0],
            g: imgData[1],
            b: imgData[2]
          };
          grdList.push({ rgb: `rgb(${item.r},${item.g},${item.b})`, ...item });
          const d = Math.abs(item.r - r) + Math.abs(item.g - g) + Math.abs(item.b - b);
          if (d < minDist) {
            minDist = d;
            idx = i;
          }
        }
        state.colorGradients = grdList;
        state.activeGrd = idx;
      }
    }
  };
  const onMovePanel = (ev: MouseEvent) => {
    const canvas = panelRef.value;
    if (canvas) {
      let x = ev.offsetX;
      if (x < 0) {
        x = 0;
      } else if (x > canvas.width) {
        x = canvas.width;
      }
      let y = ev.offsetY;
      if (y < 0) {
        y = 0;
      } else if (y > canvas.height) {
        y = canvas.height;
      }
      state.panelX = x;
      state.panelY = y;
      getPanelColor();
    }
  };
  const onGrdColor = (idx: number) => {
    const item = state.colorGradients[idx];

    state.activeGrd = idx;
    state.colorSet.r = item.r;
    state.colorSet.g = item.g;
    state.colorSet.b = item.b;
    state.color = `rgba(${item.r},${item.g},${item.b},${state.colorSet.a})`;
  };
  const onDropper = () => {
    const eyeDropper = new EyeDropper();
    state.isDropper = true;
    eyeDropper
      .open()
      .then((result: any) => {
        state.isDropper = false;
        parseColor(result.sRGBHex);
      })
      .catch((e: Error) => {
        console.log(e);
        state.isDropper = false;
      });
  };
  const parseColor = (newColor?: string) => {
    const c = newColor || props.modelValue;
    const res = getRgba(c);

    if (res) {
      const { r, g, b, a, color } = res;
      console.log(res);
      state.color = color;
      const hsv = rgb2hsv(r, g, b);
      if (barRef.value) {
        state.barY = Math.floor(hsv.h1 * barRef.value.height);
        const barColor = getImageDataColor(barImgData, state.barY * 4);
        if (barColor) state.bgColor = barColor.color;
      }
      createPanel();
      const canvas = panelRef.value;
      if (canvas) {
        state.panelX = Math.floor(hsv.s1 * canvas.width);
        state.panelY = Math.floor((1 - hsv.v1) * canvas.height);
        if (alphaRef.value) state.alphaX = Math.floor((1 - a) * alphaRef.value.offsetWidth);
        state.colorSet.r = r;
        state.colorSet.g = g;
        state.colorSet.b = b;
        state.colorSet.a = a;
        getGradients(r, g, b);
      }
    }
  };
  const onInputColor = (ev: Event) => {
    const target = ev.target as HTMLInputElement;
    if (target) parseColor(target.value);
  };
  const dragmovePanel = onDragMove({
    start: onMovePanel,
    move: onMovePanel,
    end: onMovePanel
  });

  const createPanel = () => {
    const canvas = panelRef.value;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = state.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        {
          const grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
          grd.addColorStop(0.01, 'white');
          grd.addColorStop(0.99, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        {
          const grd = ctx.createLinearGradient(0, canvas.height, 0, 0);
          grd.addColorStop(0.01, 'black');
          grd.addColorStop(0.99, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        panelImgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        panelWidthPx = canvas.width * 4;
      }
    }
  };
  const huelist = [
    'hsl(60deg, 100%, 50%)',
    'hsl(120deg, 100%, 50%)',
    'hsl(180deg, 100%, 50%)',
    'hsl(240deg, 100%, 50%)',
    'hsl(300deg, 100%, 50%)'
  ];
  const createBar = () => {
    const canvas = barRef.value;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
        const len = huelist.length + 1;
        grd.addColorStop(0.01, 'hsl(0deg, 100%, 50%)');
        huelist.forEach((a, i) => {
          grd.addColorStop((i + 1) / len, a);
        });
        grd.addColorStop(0.99, 'hsl(360deg, 100%, 50%)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        barImgData = ctx.getImageData(0, 0, 1, canvas.height).data;
      }
    }
  };
  const getAlpha = (a: number) => {
    return a === 1 ? 1 : a === 0 ? 0 : Number(a.toFixed(2));
  };
  const onAlphaMove = (ev: MouseEvent) => {
    if (alphaRef.value) {
      const w = alphaRef.value.offsetWidth;
      let x = ev.offsetX;
      if (x < 0) {
        x = 0;
      } else if (x > w) {
        x = w;
      }
      state.alphaX = x;
      state.colorSet.a = getAlpha(1 - x / w);

      state.color = `rgba(${resultColor.value.num},${state.colorSet.a})`;
    }
  };
  const dragmoveAlpha = onDragMove({
    start: onAlphaMove,
    move: onAlphaMove,
    end: onAlphaMove
  });
  onMounted(() => {
    createBar();
    parseColor();

    dragmoveBar.init(barRef.value as HTMLElement);
    dragmovePanel.init(panelRef.value as HTMLElement);
    dragmoveAlpha.init(alphaRef.value as HTMLElement);
  });
  onBeforeUnmount(() => {
    dragmoveBar.destroyed();
    dragmovePanel.destroyed();
    dragmoveAlpha.destroyed();
  });
</script>

<style lang="scss" scoped>
  .color-picker {
    --color-picker-height: 200px;
    --color-picker-width: 336px;
    --color-picker-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
    --color-picker-border: solid 1px #ccc;
    --color-picker-radius: 4px;
    border-radius: var(--color-picker-radius);
    padding: 10px;
    border: var(--color-picker-border);
    text-align: left;
    box-sizing: border-box;
    > div:not(:last-child) {
      margin-bottom: 10px;
    }
    * {
      user-select: none;
      box-sizing: border-box;
    }

    .temp-canvas {
      pointer-events: none;
      opacity: 0;
      position: absolute;
    }

    &-footer {
      height: 30px;
      display: flex;
      align-items: center;

      .color-span {
        margin-right: 10px;
      }
    }

    &-dropper {
      border-radius: 50%;
      height: 30px;
      width: 30px;
      border: var(--color-picker-border);
      padding: 4px;
      margin-right: 10px;
      cursor: pointer;
      &.active {
        border-color: dodgerblue;
      }
    }

    .color-span {
      height: 30px;
      width: 30px;
      box-shadow: var(--color-picker-shadow);
      border-radius: var(--color-picker-radius);
      display: inline-block;
      @extend .transparent-bg;
      overflow: hidden;

      > div {
        height: 100%;
        width: 100%;
      }

      &:hover {
        transform: scale(1.2);
      }
    }

    .color-picker-container {
      height: var(--color-picker-height);
      width: var(--color-picker-width);

      display: flex;

      .color-panel {
        --color-picker-panel-width: calc(var(--color-picker-width) - 30px);
        height: var(--color-picker-height);
        width: var(--color-picker-panel-width);
        display: inline-flex;

        > canvas {
          position: absolute;
          height: var(--color-picker-height);
          width: var(--color-picker-panel-width);
        }

        &-thumb {
          display: inline-block;
          pointer-events: none;
          border-radius: 50%;
          height: 10px;
          width: 10px;
          margin-top: -5px;
          margin-left: -5px;
          display: inline-block;
          border: solid 1px white;
          box-shadow: var(--color-picker-shadow);
          position: relative;
          z-index: 1;
        }
      }

      .color-bar {
        width: 20px;
        height: 100%;
        margin-left: 10px;

        > canvas {
          height: var(--color-picker-height);
          width: 20px;
          position: absolute;
        }
      }

      .color-thumb {
        display: block;
        pointer-events: none;
        height: 6px;
        width: 100%;
        border: solid 2px white;
        position: relative;
        margin-top: -3px;
        pointer-events: none;
        box-shadow: var(--color-picker-shadow);
        z-index: 1;
        transform: scale(1.2);
      }
    }

    .color-list .color-span:not(:last-child) {
      margin-right: 4px;
    }

    .color-alpha {
      height: 20px;
      width: 100%;
      border-radius: 10px;
      @extend .transparent-bg;
      box-shadow: var(--color-picker-shadow);
      &-bar {
        border-radius: 10px;
        height: 20px;
        width: var(--color-picker-width);
        position: absolute;
        background: linear-gradient(to right, red 0.1%, rgba(255, 0, 0, 0) 99.9%);
      }

      &-thumb {
        display: block;
        pointer-events: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        border: solid 2px white;
        position: relative;
        margin-left: -10px;
        pointer-events: none;
        box-shadow: var(--color-picker-shadow);
        z-index: 1;
      }
    }

    .color-gradient {
      height: 20px;
      width: 100%;
      display: flex;
      border: var(--color-picker-border);

      > span {
        height: 100%;
        flex: 1;
        display: inline-block;

        &.active {
          transform: scale(1.2);
          box-shadow: var(--color-picker-shadow);
        }
      }
    }

    .transparent-bg {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
    }

    &-input {
      padding: 0 8px;
      outline: none;
      border: var(--color-picker-border);
      font-size: 16px;
      height: 30px;
      width: calc(100% - 80px);
    }
  }
</style>
