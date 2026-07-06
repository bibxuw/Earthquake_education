<template>
  <div class="home-container">
    <div class="glass-overlay">
      
      <header class="top-nav">
        <div class="logo">
          <img src="../assets/schoollogo.png" alt="内江二中校徽" class="school-logo" />
          <span class="logo-text">防震减灾科普教学平台</span>
        </div>
        <div class="nav-actions">
          <span class="nav-item">首页</span>
          <span class="nav-item">教学大纲</span>
          <span class="nav-item">关于项目</span>
        </div>
      </header>

      <div class="content-wrapper">
        <div class="badge">
          ✨ 交互式沉浸教学体验
        </div>

        <h1 class="main-title">教学楼的悄悄话：<br/><span class="highlight">地震时的疏散密码</span></h1>
        
        <p class="subtitle">探索地震科学，掌握生命救援的黄金法则</p>
        
        <div class="button-group">
          <button class="nav-btn" @click="goToComponent('WaveSimulator')">
            <div class="btn-icon">⏱️</div>
            <div class="btn-text">
              <span class="btn-title">时间密码</span>
              <span class="btn-desc">地震波时差定量模拟器</span>
            </div>
          </button>
          
          <button class="nav-btn" @click="goToComponent('HazardHunt')">
            <div class="btn-icon">⛑️</div>
            <div class="btn-text">
              <span class="btn-title">结构密码</span>
              <span class="btn-desc">教室危险源排查交互</span>
            </div>
          </button>
          
          <button class="nav-btn" @click="goToComponent('EvacuationRoute')">
            <div class="btn-icon">🏃</div>
            <div class="btn-text">
              <span class="btn-title">行动密码</span>
              <span class="btn-desc">疏散路线与避险规划</span>
            </div>
          </button>
        </div>
      </div>

      <footer class="bottom-footer">
        <div class="authors">
          <strong>参赛作者：</strong> 李倩、赵岚、潘浩 <span class="divider">|</span> <strong>四川省内江市第二中学</strong>
        </div>
        <p class="copyright">© 2026年四川省教师数字素养提升实践活动 | 探索未知，守护生命</p>
      </footer>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import './Home.css';

const router = useRouter();
const goToComponent = (componentName) => {
  // 这里传入的 componentName 就是我们在 router/index.ts 中定义的 name
  router.push({ name: componentName });
};
</script>