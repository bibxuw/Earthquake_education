<template>
  <div class="action-page">
    
    <HeaderNav 
      icon="🏃" 
      titleBlack="行动密码：" 
      titleBlue="疏散路线与避险规划" 
      :rightButtons="[
        { label: '⏱️ 时间密码', path: '/wave' },
        { label: '⛑️ 结构密码', path: '/hazard' }
      ]"
    />

    <main class="action-container">
      
      <section class="simulation-board glass-card">
        <div class="canvas-wrapper">
          <img src="../assets/bus-layout.png" class="bus-bg" />
          
          <canvas ref="busCanvas" class="bus-canvas" width="800" height="400"></canvas>
        </div>
      </section>

      <aside class="control-panel glass-card">
        <h3 class="panel-title">🎛️ 疏散演练参数</h3>
        
        <div class="slider-group">
          <div class="slider-header">
            <label class="blue-bold-label">车速 (km/h)</label>
            <span class="param-value">{{ speed }}km/h</span>
          </div>
          
          <div class="slider-track-wrapper">
            <span class="limit-label">5</span> <input type="range" class="custom-slider" v-model="speed" min="5" max="60" />
            <span class="limit-label">60</span> </div>
        </div>

        <div class="slider-group">
          <div class="slider-header">
            <label class="blue-bold-label">制动缓冲 (s)</label>
            <span class="param-value">{{ brakeTime }}s</span>
          </div>
          
          <div class="slider-track-wrapper">
            <span class="limit-label">3</span> <input type="range" class="custom-slider" v-model="brakeTime" min="3" max="40" />
            <span class="limit-label">40</span> </div>
        </div>
        <div class="slider-group">
        <div class="slider-header">
          <label class="blue-bold-label">载客密度 (%)</label>
          <span class="param-value">{{  density }}%</span>
          </div>
          
          <div class="slider-track-wrapper">
            <span class="limit-label">10</span> <input type="range" class="custom-slider" v-model="density" min="10" max="100" />
            <span class="limit-label">100</span> </div>
        </div>

        <button class="primary-btn" @click="startSimulation">
          {{ isSimulating ? '🛑 停止演练' : '🚀 开始演练' }}
        </button>

        <div class="monitor-section">
          <h3 class="panel-title">📊 实时压力波动</h3>
          <div id="chart-container" style="height: 50px; width: 100%;"></div>
        </div>
      </aside>

    </main>

   <footer class="bottom-action">
    <KnowledgeInteraction 
      buttonText="📋 查看疏散分析报告" 
      modalTitle="📊 演练评估结果"
    >
    <template #content>
    <div class="evaluation-report">
      <div class="report-params">
        <div class="param-box">
          <span class="param-label">当前车速</span>
          <span class="param-val-large">{{ speed }} <small>km/h</small></span>
        </div>
        <div class="param-box">
          <span class="param-label">人群密度</span>
          <span class="param-val-large">{{ density }} <small>%</small></span>
        </div>
        <div class="param-box">
          <span class="param-label">制动时长</span>
          <span class="param-val-large">{{ brakeTime }} <small>s</small></span>
        </div>
      </div>

      <div class="formula-box">
        <div class="formula-title">计算逻辑: F = (v² / (10 * t)) * ρ</div>
        <div class="formula-desc">F: 惯性力(N) | v: 速度(km/h) | t: 时间(s) | ρ: 密度系数</div>
      </div>

      <div class="report-results">
        <div class="result-row">
          <span>惯性冲击力:</span>
          <span class="result-num danger-text">{{ inertiaForce }} N</span>
        </div>
        <div class="result-row">
          <span>安全评分:</span>
          <span class="result-num">{{ safetyScore }} 分</span>
        </div>
      </div>
    </div>
  </template>
    </KnowledgeInteraction>
      <KnowledgeInteraction 
        buttonText="💡 疏散避险科学科普" 
        modalTitle="💡 为什么地震疏散时绝不能拥挤？"
      >
        <template #content>
          <p>在紧急疏散或公交车急刹车时，由于<strong>惯性定律</strong>，人体会保持原有的运动状态。如果人流密度过大：</p>
          <ul>
            <li><strong>力的叠加效应</strong>：后方人群的推力会像海浪一样叠加，前方人员一旦摔倒，承受的压力可达上千公斤！</li>
            <li><strong>踩踏危机</strong>：楼梯间是发生踩踏的极高危区域。</li>
          </ul>
          <div class="highlight-text">
            <strong>行动口诀：</strong> 不推不挤不逆行，护住头部靠右行！
          </div>
        </template>
      </KnowledgeInteraction>
    </footer>

  </div>
</template>
<script setup>
import HeaderNav from '../components/HeaderNav.vue';
import KnowledgeInteraction from '../components/KnowledgeInteraction.vue';
import * as echarts from 'echarts';
import { onMounted, ref, onBeforeUnmount, computed, watch } from 'vue';

// ==========================================
// 1. 第一步：先定义所有响应式变量（状态）
// ==========================================
const speed = ref(40);
const brakeTime = ref(3);
const density = ref(50);
const isSimulating = ref(false);

const busCanvas = ref(null);
const pressureData = ref(new Array(20).fill(0));
const passengers = ref([]);

let ctx = null;
let chartRef = null;
let pressureChart = null;
let timer = null;
let animationFrameId = null;
let basePositions = []; // 存储初始状态的备份

// ==========================================
// 2. 第二步：定义计算属性 (依赖上面的变量)
// ==========================================
const inertiaForce = computed(() => {
  const mass = 50 + density.value * 0.5;
  const deceleration = speed.value / 2;
  return Math.round(mass * deceleration);
});

const safetyScore = computed(() => {
  let score = 100 - (density.value * 0.4) - (inertiaForce.value / 50);
  return Math.max(0, Math.round(score));
});

const evaluationResult = computed(() => {
  if (safetyScore.value > 80) return { text: "✅ 当前状态平稳，疏散风险极低。", isDanger: false };
  if (safetyScore.value > 50) return { text: "⚠️ 惯性力较大，请注意保持重心，严禁推挤！", isDanger: false };
  return { text: "危险！惯性力已达到临界值，极易引发踩踏事故！", isDanger: true };
});

// ==========================================
// 3. 第三步：定义核心函数与监听器
// ==========================================
const generatePassengers = () => {
  if (isSimulating.value) return; 

  const maxCapacity = 100; 
  const currentCount = Math.floor((density.value / 100) * maxCapacity);
  
  let newPositions = [];
  const area = { minX: 150, maxX: 650, minY: 150, maxY: 300 };

  for (let i = 0; i < currentCount; i++) {
    newPositions.push({
      id: i,
      baseX: area.minX + Math.random() * (area.maxX - area.minX),
      baseY: area.minY + Math.random() * (area.maxY - area.minY),
      x: 0, 
      y: 0,
      targetX: 0, 
      color: '#3b82f6' 
    });
  }

  newPositions.forEach(p => {
    p.x = p.baseX;
    p.y = p.baseY;
    p.targetX = p.baseX;
  });

  passengers.value = newPositions;
  basePositions = JSON.parse(JSON.stringify(newPositions)); 
  drawPassengers();
};

watch(density, () => {
  generatePassengers();
});

const drawPassengers = () => {
  if (!ctx || !busCanvas.value) return;
  ctx.clearRect(0, 0, busCanvas.value.width, busCanvas.value.height);

  ctx.globalAlpha = 0.7; 
  passengers.value.forEach(p => {
    ctx.fillStyle = p.color || '#3b82f6';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
  ctx.globalAlpha = 1.0; 
};

const animate = () => {
  if (!isSimulating.value) return; 
  let isMoving = false;

  // 【核心修改1：动态动画速度 (缓动系数)】
  // 制动时间 brakeTime 越短，easing 越大，动画停顿越“猛烈/干脆”
  // 制动时间 brakeTime 越长，easing 越小，动画停顿越“平滑/缓慢”
  // 假设 brakeTime 是 1s-5s，那么系数在 0.25 (快) 到 0.05 (慢) 之间变化
  const easing = 0.25 / brakeTime.value;

  passengers.value.forEach(p => {
    const dx = p.targetX - p.x;
    if (Math.abs(dx) > 0.5) {
      p.x += dx * easing; 
      isMoving = true;
    }
  });

  drawPassengers();
  
  if (isMoving) {
    animationFrameId = requestAnimationFrame(animate);
  }
};

const startSimulation = () => {
  isSimulating.value = !isSimulating.value;

  if (isSimulating.value) {
    console.log("刹车演练开始 - 计算惯性位移");
    
    // 【核心修改2：放大像素位移比例】
    const inertiaFactor = (Math.pow(speed.value, 1.8)) / brakeTime.value * 1.5;
    
    passengers.value.forEach(p => {
      // 增加随机偏移量 (0~150)，模拟人群在混乱中受力不均、互相推挤的错落感
      const rushDistance = inertiaFactor + (Math.random() * 150);
      
      // 限制最大位移，假设 X=750 是车厢最前端（挡风玻璃/前门），人群会“堆叠”在这里
      p.targetX = Math.min(p.baseX + rushDistance, 750); 
      
      // 动态颜色阈值也相应放大：位移跨度超过 200 像素即为严重危险
      p.color = rushDistance > 200 ? '#ef4444' : (rushDistance > 100 ? '#f59e0b' : '#3b82f6');
    });

    animate(); 
  } else {
    console.log("演练复位");
    cancelAnimationFrame(animationFrameId);
    // 复位到备份的原始位置
    passengers.value = JSON.parse(JSON.stringify(basePositions));
    drawPassengers();
  }
};
// ==========================================
// 4. ECharts 图表相关函数
// ==========================================
const initChart = () => {
  const chartDom = document.getElementById('chart-container');
  if (!chartDom) return;
  pressureChart = echarts.init(chartDom);
  
  const option = {
    grid: { top: 10, bottom: 20, left: 30, right: 10 },
    xAxis: { type: 'category', show: false }, 
    yAxis: { type: 'value', min: 0, max: 100 },
    series: [{
      data: pressureData.value,
      type: 'line',
      smooth: true,
      lineStyle: { color: '#3b82f6', width: 3 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
        { offset: 1, color: 'rgba(59, 130, 246, 0)' }
      ])}
    }]
  };
  pressureChart.setOption(option);
};

const updatePressure = () => {
  if (!isSimulating.value) return;

  const basePressure = (density.value * 0.6) + (speed.value * 0.4);
  const randomFluctuation = (Math.random() - 0.5) * 15; 
  const currentPressure = Math.max(0, Math.min(100, basePressure + randomFluctuation));

  pressureData.value.push(currentPressure.toFixed(1));
  pressureData.value.shift(); 

  if(pressureChart) {
    pressureChart.setOption({
      series: [{
        data: pressureData.value,
        lineStyle: { color: currentPressure > 70 ? '#ef4444' : '#3b82f6' },
        areaStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: currentPressure > 70 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)' },
            { offset: 1, color: 'rgba(255, 255, 255, 0)' }
          ])
        }
      }]
    });
  }
};

// ==========================================
// 5. 生命周期钩子
// ==========================================
onMounted(() => {
  const canvas = busCanvas.value;
  if (canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx = canvas.getContext('2d');
  }

  generatePassengers(); 

  const img = new Image();
  img.src = new URL('../assets/bus-layout.png', import.meta.url).href;
  img.onload = () => { drawPassengers(); };

  initChart();
  timer = setInterval(updatePressure, 500);
});

onBeforeUnmount(() => {
  clearInterval(timer);
  cancelAnimationFrame(animationFrameId);
  if (pressureChart) {
    pressureChart.dispose();
  }
});
</script>

<style>
@import './BusInertia.css';
@import '../assets/global.css';
</style>