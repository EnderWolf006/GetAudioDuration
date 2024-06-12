<script setup>
import Form from './components/Form.vue'
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
