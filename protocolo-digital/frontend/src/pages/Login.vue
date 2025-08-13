<template>
  <div class="login">
    <h1>Login</h1>
    <form @submit.prevent="submit">
      <input v-model="username" placeholder="Usuário" />
      <input v-model="password" type="password" placeholder="Senha" />
      <button type="submit">Entrar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const username = ref('');
const password = ref('');

function submit() {
  alert(`Usuário: ${username.value}`);
}
</script>

<style scoped>
.login {
  max-width: 320px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
