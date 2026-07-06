<template>
  <div class="simulator-page">
   <HeaderNav 
      icon="⏱️" 
      titleBlack="时间密码：" 
      titleBlue="地震波时差定量模拟器" 
      :rightButtons="[
        { label: '⛑️ 结构密码', path: '/hazard' },
        { label: '🏃 疏散路径', path: '/action' }
      ]"
    />

    <main class="main-content-grid">
      <section class="glass-card building-area" 
         :class="{ 'shake-p': isPWaveState && !isSWaveState, 'shake-s': isSWaveState }">
        <img src="../assets/teaching_building.jpg" class="building-img" />
      </section>
      
    <section class="glass-card wave-area">
     <button class="wave-science-btn" @click="showWaveModal = true">
        📊 波形科学
      </button>
      <div class="wave-group">
        <div class="wave-header">PRIMARY WAVE (P波)</div>
        <div id="p-wave-chart" class="wave-box"></div>
      </div>

      <div class="wave-group">
        <div class="wave-header" :data-label="sLabel">
          SECONDARY WAVE (S波) <span style="color: #d97706; font-size: 0.9rem;">{{ sLabel }}</span>
        </div>
        <div id="s-wave-chart" class="wave-box"></div>
      </div>
    </section>

    <transition name="fade">
      <div class="modal-overlay" v-if="showWaveModal" @click.self="showWaveModal = false">
        <div class="modal-card">
          <button class="close-btn" @click="showWaveModal = false">✖</button>
          <h2 class="modal-title">📊 地震波形监测原理</h2>
          <div class="modal-body">
            <p>地震监测仪通过记录地表震动产生连续波形图，其核心原理是利用 P、S 波的速度差来定位：</p>
            <ul>
              <li><strong>P波形态</strong>：周期短、频率高，表现为细密的震动。</li>
              <li><strong>S波形态</strong>：周期长、振幅大，表现为大幅度的摆动。</li>
            </ul>
            
            <div class="highlight-text">
              <strong>核心原理：</strong> P波传播速度快，S波传播速度慢。监测仪记录的 P-S 波时差（Δt）与震中距离成正比。
            </div>

            <div class="formula-box">
              <strong>物理模拟公式：</strong><br/>
              <span style="font-family: monospace; font-size: 1.1rem;">
                Δt = D / V<sub>s</sub> - D / V<sub>p</sub><br/>
                (其中 V<sub>p</sub> ≈ 6.0 km/s, V<sub>s</sub> ≈ 3.5 km/s)
              </span>
            </div>
            <p style="margin-top: 15px; font-size: 0.9rem; color: #64748b;">
              *注：在本次模拟器中，通过调整震中距离 D，公式会自动计算出 S 波的预警延迟时间。
            </p>
          </div>
          <div class="modal-actions">
            <button class="interact-btn note-btn" @click="handleAddNote">📝 记录批注</button>
            <button class="interact-btn question-btn" @click="handleAskQuestion">❓ 提问互动</button>
          </div>
        </div>
      </div>
    </transition>

    </main>

    <footer class="glass-card control-area">
      <div class="control-section align-left">
      <div class="distance-dashboard">
        <div class="distance-header">
          <span class="icon-map">📍</span>
          <label class="control-label">震中距离 (EPICENTER)</label>
        </div>
        <div class="distance-controls">
          <span class="limit-label">10km</span>
          <input type="range" class="custom-slider" v-model.number="distance" min="10" max="150" :disabled="isSimulating" />
          <span class="limit-label">150km</span>
          <div class="input-container">
            <input type="number" class="distance-input" v-model.number="distance" min="10" max="150" :disabled="isSimulating" />
            <span class="unit">km</span>
          </div>
        </div>
      </div>
      </div>

      <div class="control-section align-center">
        <div class="time-display-wrapper extended-time" :class="{ 'is-danger': currentGoldenTime <= 0 && isSimulating }">
          <div class="time-progress-bar" :style="{ width: progressPercentage + '%' }"></div>
          <div class="time-content">
            <span class="time-label">黄金避险时间:</span>
            <span class="time-value">{{ displayTime }}</span>
            <span class="time-unit">秒</span>
          </div>
        </div>
      </div>

      <div class="control-section align-right">
        <div class="action-tower">
          <button class="start-btn" @click="startSimulation" :disabled="isSimulating">
            {{ isSimulating ? '地震波传输中...' : '🚀 启动模拟' }}
          </button>
          <button class="info-btn-new" @click="showScienceModal = true">
            💡 黄金避险时间科普
          </button>
        </div>
      </div>
    </footer>

    <transition name="fade">
      <div class="modal-overlay" v-if="showScienceModal" @click.self="showScienceModal = false">
        <div class="modal-card">
          <button class="close-btn" @click="showScienceModal = false">✖</button>
          <h2 class="modal-title">💡 什么是“黄金避险时间”？</h2>
          <div class="modal-body">
            <p>地震发生时，会产生两种主要的地震波：</p>
            <ul>
              <li><strong>P波（纵波）</strong>：传播速度快（约 6.0 km/s），最先到达地面，使人感觉上下颠簸，破坏力较小。</li>
              <li><strong>S波（横波）</strong>：传播速度慢（约 3.5 km/s），随后到达，使人感觉左右摇晃，是造成建筑物破坏的元凶。</li>
            </ul>
            <p class="highlight-text">
              <strong>黄金避险时间</strong> 就是指 <strong>P波到达后，直到 S波到达前的这段时间差</strong>。
            </p>
            <p>虽然只有短短十几秒到几十秒，但利用这个时间差，人们可以迅速躲到坚固的桌下或安全三角区，极大提高生存几率！</p>
            <div class="formula-box">
              计算公式：<br/>
              Δt (秒) = 距离 / S波速度 - 距离 / P波速度
            </div>
          </div>
          <div class="modal-actions">
            <button class="interact-btn note-btn" @click="handleAddNote">📝 记录批注</button>
            <button class="interact-btn question-btn" @click="handleAskQuestion">❓ 提问互动</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div class="modal-overlay" v-if="showInputModal" @click.self="showInputModal = false" style="z-index: 1005;">
        <div class="book-page-modal">
          <button class="close-btn" @click="showInputModal = false">✖</button>
          <h2 class="book-title">{{ inputModalTitle }}</h2>
          <div class="book-content">
            <textarea v-model="inputText" class="book-textarea" :placeholder="inputModalTitle.includes('批注') ? '在这里写下你的学习心得...' : '有什么疑问？在向 老师/同学 提问吧...'"></textarea>
          </div>
          <div class="book-actions">
            <button class="book-submit-btn" @click="handleSubmitInput">完 成</button>
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div class="modal-overlay" v-if="showToast" style="z-index: 10006;">
        <div class="success-dialog">
          <p class="dialog-msg">{{ toastMessage }}</p>
          <button class="dialog-confirm-btn" @click="showToast = false">确 定</button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import HeaderNav from '../components/HeaderNav.vue';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';

const router = useRouter();
// --- 基础状态与配置 ---
const VP = 6.0;
const VS = 3.5;
const showScienceModal = ref(false);
const showWaveModal = ref(false);
const showInputModal = ref(false);
const inputModalTitle = ref('');
const inputText = ref('');
const isPWaveState = ref(false);
const isSWaveState = ref(false); 
const distance = ref(100);
const isSimulating = ref(false);
const currentGoldenTime = ref(0);
let timerId: any = null;

// --- ECharts 实例 ---
let pChart: echarts.ECharts | null = null;
let sChart: echarts.ECharts | null = null;

// --- Toast 提示状态 ---
const showToast = ref(false);
const toastMessage = ref('');

// --- 计算属性 ---
const timeDiff = computed(() => (distance.value / VS) - (distance.value / VP));
const displayTime = computed(() => (!isSimulating.value ? timeDiff.value.toFixed(1) : Math.max(0, currentGoldenTime.value).toFixed(1)));
const progressPercentage = computed(() => !isSimulating.value ? 100 : Math.max(0, (currentGoldenTime.value / timeDiff.value) * 100));

// --- 图表逻辑 ---
const initCharts = () => {
  const pDom = document.getElementById('p-wave-chart');
  const sDom = document.getElementById('s-wave-chart');
  if (!pDom || !sDom) return;

  if (pDom.clientWidth === 0) {
    setTimeout(initCharts, 50);
    return;
  }

  pChart = echarts.init(pDom);
  sChart = echarts.init(sDom);

  const industrialOption = {
    // 增加内边距以容纳坐标文字
    grid: { left: '12%', right: '5%', top: '15%', bottom: '20%' },
    xAxis: { 
      type: 'value', 
      min: 0, max: 100,
      name: '时间 (ms)',
      nameLocation: 'middle',
      nameGap: 25,
      nameTextStyle: { fontSize: 14, fontWeight: 'bold', color: '#334155' }, // 增大字体
      axisLabel: { fontSize: 12, color: '#334155' }, // 增大刻度字体
      splitLine: { show: true, lineStyle: { type: 'dashed' } }
    },
    yAxis: { 
      type: 'value', 
      min: -1, max: 1,
      name: '振幅',
      nameTextStyle: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
      axisLabel: { fontSize: 12, color: '#334155' }, // 增大刻度字体
      splitLine: { show: true, lineStyle: { type: 'dashed' } }
    },
    series: [{ 
      type: 'line', 
      showSymbol: false, 
      smooth: true,
      lineStyle: { width: 3 },
      data: Array.from({ length: 100 }, (_, i) => [i, 0]) // 初始化为坐标对 [x, y]
    }]
  };
  
  pChart.setOption({ ...industrialOption, series: [{ ...industrialOption.series[0], lineStyle: { color: '#065f46' } }] });
  sChart.setOption({ ...industrialOption, series: [{ ...industrialOption.series[0], lineStyle: { color: '#b45309' } }] });
};
const updateCharts = (time: number, isP: boolean, isS: boolean) => {
  if (!pChart || !sChart) return;

  // 生成坐标对：[x轴时间点, y轴振幅]
  const pData = Array.from({ length: 100 }, (_, i) => [
    i, 
    isP ? (Math.sin(i * 0.4 + time * 30) * 0.2 + (Math.random() - 0.5) * 0.05) : 0
  ]);
  
  const sData = Array.from({ length: 100 }, (_, i) => [
    i, 
    isS ? Math.sin(i * 0.2 + time * 10) * 0.9 : 0
  ]);
  
  pChart.setOption({ series: [{ data: pData }] });
  sChart.setOption({ series: [{ data: sData }] });
};

// 增加一个响应式变量来存储 S 波的倒计时状态
const sLabel = computed(() => {
  if (isSimulating.value && currentGoldenTime.value > 0) {
    return `S-WAVE - 预警: ${currentGoldenTime.value.toFixed(1)}秒`;
  } else if (isSimulating.value && currentGoldenTime.value <= 0) {
    return `S-WAVE - 震动中`;
  }
  return `S-WAVE - 到达时间: ${timeDiff.value.toFixed(1)}秒`;
});

const startSimulation = () => {
  isSimulating.value = true;
  currentGoldenTime.value = timeDiff.value;
  
  // 1. 模拟开始：P波激活（轻微抖动开始）
  isPWaveState.value = true; 
  isSWaveState.value = false;
  
  if (timerId) clearInterval(timerId);
  
  timerId = setInterval(() => {
    currentGoldenTime.value -= 0.1;
    
    // 2. 核心状态判定：当倒计时归零时，S波到达，触发剧烈震动
    const sHasArrived = currentGoldenTime.value <= 0;
    
    if (sHasArrived) {
      isPWaveState.value = false; // P波抖动停止
      isSWaveState.value = true;  // S波剧烈震动开始
    }
    
    // 调用更新图表函数
    updateCharts(currentGoldenTime.value, true, sHasArrived);

    // 3. 模拟结束逻辑
    if (currentGoldenTime.value <= -1.5) { // 增加 S 波持续时间
      clearInterval(timerId);
      isSWaveState.value = false;
      isPWaveState.value = false;
      isSimulating.value = false;
    }
  }, 100);
};

const handleAddNote = () => { 
  showScienceModal.value = false;
  showWaveModal.value = false;
  inputModalTitle.value = '📝 记录批注'; 
  inputText.value = ''; 
  showInputModal.value = true; 
};

const handleAskQuestion = () => { 
  showScienceModal.value = false;
  showWaveModal.value = false;
  inputModalTitle.value = '❓ 互动提问'; 
  inputText.value = ''; 
  showInputModal.value = true; 
};

const handleSubmitInput = () => {
  if (!inputText.value.trim()) {
    triggerToast('内容不能为空哦！', 'error');
    return;
  }
  const msg = inputModalTitle.value.includes('批注') ? '心得记录成功！' : '提问已发布。';
  showInputModal.value = false;
  inputText.value = ''; 
  triggerToast(msg, 'success'); 
};

const triggerToast = (msg: string, type: 'success' | 'error') => {
  toastMessage.value = msg;
  showToast.value = true;
};


onMounted(() => {
  nextTick(() => {
    initCharts();
    
    // 使用 ResizeObserver 监听容器，比 window resize 更精准
    const container = document.querySelector('.wave-area');
    if (container) {
      const ro = new ResizeObserver(() => {
        pChart?.resize();
        sChart?.resize();
      });
      ro.observe(container);
    }
  });
});

</script>
<style>
@import './WaveSimulator.css';
@import '../assets/global.css';
</style>