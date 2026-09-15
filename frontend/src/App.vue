<template>
  <div class="app-shell">
    <aside class="sidebar">
      <h1>TaskFlow</h1>
      <nav>
        <router-link to="/">Dashboard</router-link>
        <router-link to="/solicitudes">Solicitudes</router-link>
        <router-link to="/nueva-solicitud">Nueva solicitud</router-link>
        <router-link to="/monitor">Monitor</router-link>
      </nav>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: #f4f7fb;
  color: #1f2937;
}
.sidebar {
  width: 240px;
  background: #0f172a;
  color: white;
  padding: 24px 16px;
}
.sidebar h1 {
  margin: 0 0 24px;
  font-size: 1.7rem;
}
.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sidebar a {
  color: #dbeafe;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 8px;
}
.sidebar a.router-link-active {
  background: #1d4ed8;
}
.content {
  flex: 1;
  padding: 24px;
}
</style>
