<script setup>
import Form from './components/Form.vue'
import { bitable } from '@lark-base-open/js-sdk';
import { ref, onMounted } from 'vue';
import { useDark, useToggle } from '@vueuse/core'
const theme = ref('');

const setThemeColor = () => {
  console.log(1);
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  toggleDark(theme.value == 'DARK')
};

// 挂载时处理
onMounted(async () => {
  theme.value = await bitable.bridge.getTheme();
  setThemeColor();
});

// 主题修改时处理
bitable.bridge.onThemeChange((event) => {
  theme.value = event.data.theme;
  setThemeColor();
});


</script>

<template>
  <main>
    <h1> {{ $t('title') }} </h1>
    <Form />
  </main>
</template>

<style scoped>
main {
  padding: 1rem;
}

h1 {
  font-size: calc(1.275rem + 0.3vw);
  margin-bottom: 1rem;
}

code {
  font-size: 0.875em;
  color: #d63384;
  word-wrap: break-word;
}
</style>
