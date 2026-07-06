<template>
  <header class="nav-card">
    
    <button class="mini-nav-btn" @click="router.push('/')">
      🏠 返回首页
    </button>

    <div class="nav-title-area">
      <span class="title-icon">{{ icon }}</span>
      <span class="title-black">{{ titleBlack }}</span>
      <span class="title-blue">{{ titleBlue }}</span>
    </div>

    <div class="nav-btn-wrapper">
      <button 
        v-for="(btn, index) in rightButtons" 
        :key="index"
        class="mini-nav-btn" 
        @click="router.push(btn.path)"
      >
        {{ btn.label }}
      </button>
    </div>

  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

defineProps({
  icon: { type: String, default: '⏱️' },
  titleBlack: { type: String, default: '时间密码：' },
  titleBlue: { type: String, default: '地震波时差定量模拟器' },
  rightButtons: {
    type: Array,
    default: () => [
      { label: '⛑️ 隐患排查', path: '/hazard' },
      { label: '🏃 疏散路径', path: '/action' }
    ]
  }
});
</script>

<style scoped>
/* ==================== 顶部导航栏容器 (使用你提供的样式) ==================== */
.nav-card {
  width: 100%;
  height: 85px; /* 稍微加高一点点适配大字体 */
  flex-shrink: 0;
  
  /* 边框设定 */
  border-top: none !important;
  border-left: 2px solid #dae7f8 !important;
  border-right: 2px solid #dae7f8 !important;
  border-bottom: 3px solid #dae7f8 !important;
  border-radius: 0 0 25px 25px !important;
  
  /* 关键：模仿参考图的淡蓝渐变背景 */
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.85) 0%, rgba(206, 227, 252, 0.95) 100%);
  backdrop-filter: blur(20px);
  
  /* 布局与大号加粗字体 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px; /* 增加左右内边距 */
  font-size: 2.6rem;    /* 字体变大 */
  font-weight: 900;     /* 字体加粗到极黑 */
  gap: 15px;            /* 图标和文字的间距 */
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
  position: relative;   /* 确保绝对居中的标题能以此为参照物 */
}

/* ==================== 标题区域 (绝对居中) ==================== */
.nav-title-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  
  font-size: 2.6rem;
  font-weight: 900;
  pointer-events: none; /* 防止遮挡下方可能存在的点击事件 */
}

.title-icon { font-size: 2.8rem; }
.title-black { color: #1e293b; }
.title-blue { color: #2563eb; }

/* ==================== 右侧按钮组 ==================== */
.nav-btn-wrapper {
  display: flex;
  gap: 12px;
  /* 因为 nav-card 使用了 space-between，右侧按钮会自动靠右，这里不需要特别设置 margin-left: auto */
}

</style>