<template>
  <MainLayout>
    <router-view />
  </MainLayout>
  <ToastHost />
</template>

<script setup>
import MainLayout from './layouts/MainLayout.vue'
import ToastHost from './components/ToastHost.vue'
</script>
