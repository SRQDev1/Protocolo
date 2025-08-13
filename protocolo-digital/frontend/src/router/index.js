import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Dashboard from '../pages/Dashboard.vue';
import Protocols from '../pages/Protocols.vue';
import Users from '../pages/Users.vue';
import AccessDenied from '../pages/AccessDenied.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/protocols', component: Protocols },
  { path: '/users', component: Users },
  { path: '/acesso-negado', component: AccessDenied }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
