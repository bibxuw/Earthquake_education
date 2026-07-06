<template>
  <div class="hazard-page">
     <HeaderNav 
      icon="⛑️" 
      titleBlack="结构密码：" 
      titleBlue="教室危险源排查交互" 
      :rightButtons="[
        { label: '⏱️ 时间密码', path: '/wave' },
        { label: '🏃 行动密码', path: '/action' }
      ]"
    />

    <main class="game-container">
        <div class="classroom-board">
        <img src="../assets/classroom_bg.png" alt="教室全景" class="classroom-bg" draggable="false" @click="getClickPercent" />
        
        <template v-for="target in targets" :key="target.id">
          <div 
            v-for="(zone, index) in target.zones" :key="target.id + '-' + index"
            class="interactive-zone"
            :class="[target.type, { 'is-found': foundZones.has(target.id + '-' + index) }]"
            :style="{ top: zone.top, left: zone.left, width: zone.width, height: zone.height }"
            @click="handleFind(target, index)"
          >
            <transition name="pop">
              <div v-if="foundZones.has(target.id + '-' + index)" class="feedback-icon">
                {{ target.isDangerous ? '👷‍♂️' : '🛡️' }}
              </div>
            </transition>
          </div>
        </template>
      </div>

      <aside class="sidebar-panel">
        <div class="progress-header">
          <h3>排查进度：{{ foundItems.size }} / {{ targets.length }}</h3>
        </div>

        <div class="status-sections">
          <div class="status-card danger-section">
            <h4>❌ 危险警示 (已发现: {{ foundItemsCount('danger') }})</h4>
            <div class="list-grid">
              <div v-for="t in getTargetsByType('danger')" :key="t.id" 
                  :class="['item-pill', { 'active': foundItems.has(t.id) }]">
                {{ foundItems.has(t.id) ? t.name : '???' }}
              </div>
            </div>
          </div>

          <div class="status-card safe-section">
            <h4>✅ 生命盾牌 (已发现: {{ foundItemsCount('safe') }})</h4>
            <div class="list-grid">
              <div v-for="t in getTargetsByType('safe')" :key="t.id" 
                  :class="['item-pill', { 'active': foundItems.has(t.id) }]">
                {{ foundItems.has(t.id) ? t.name : '???' }}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <footer class="bottom-action">
    
      <button class="game-action-btn reset-btn" @click="resetGame">🔁 重新开始</button>
      <button class="game-action-btn hint-btn" @click="showHint">🔍 游戏提示</button>
      <KnowledgeInteraction 
        buttonText="💡 建筑承重结构科普" 
        modalTitle="💡 什么是承重墙与避险三角区？"
      >
        <template #content>
          <p>在教学楼中，不同颜色的墙体代表了不同的结构：</p>
          <ul>
            <li><strong>承重墙角</strong>：支撑整栋楼重量的脊梁，地震时最坚固的依靠，不易发生坍塌。</li>
            <li><strong>非承重悬挂物</strong>：如吊灯、风扇，地震时强烈的水平剪切力极易导致连接处断裂砸落。</li>
          </ul>
          <div class="highlight-text">
            <strong>避险口诀：</strong> 墙角桌下最安全，远离窗户和风扇！
          </div>
        </template>
      </KnowledgeInteraction>
      
    </footer>

    <transition name="fade">
      <div class="modal-overlay" v-if="currentFeedback" style="z-index: 10006;">
        <div class="feedback-dialog" :class="currentFeedback.isDangerous ? 'danger-style' : 'safe-style'">
          <h3 class="feedback-title">
            {{ currentFeedback.isDangerous ? '❌ 排查失败：高危源！' : '✅ 排查成功：安全区！' }}
          </h3>
          <p class="feedback-msg">{{ currentFeedback.tip }}</p>
          <button class="dialog-confirm-btn" @click="currentFeedback = null">确 定</button>
        </div>
      </div>
    </transition>

    <transition name="fade">
          <div v-if="isGameComplete" class="success-modal-overlay">
            <div class="success-modal">
              <div class="trophy">🏆</div>
              <h2>恭喜获得“防震小能手”称号！</h2>
              <p>你已成功发现所有隐患与安全点，防震意识顶呱呱！</p>
              <button @click="resetGame" class="continue-btn">重新排查</button>
            </div>
          </div>
        </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onMounted } from 'vue';
import HeaderNav from '../components/HeaderNav.vue';
import KnowledgeInteraction from '../components/KnowledgeInteraction.vue';

const targets = ref([
  // ❌ 危险警示 (5个逻辑点)
  { 
    id: 'lamp', name: '吊灯', isDangerous: true, type: 'danger', tip: '危险！地震时非承重构件极易坠落。',
    zones: [
      { top: '8.6%', left: '48.8%', width: '8%', height: '8%' },
      { top: '9.1%', left: '18.2%', width: '8%', height: '8%' },
      { top: '8.5%', left: '83.9%', width: '8%', height: '8%' },
      { top: '15.4%', left: '52.4%', width: '8%', height: '8%' },
      { top: '14.9%', left: '80.4%', width: '8%', height: '8%' },
      { top: '7.8%', left: '18.0%', width: '8%', height: '8%' },
      { top: '15.4%', left: '26.3%', width: '8%', height: '8%' },
      { top: '14.9%', left: '45.1%', width: '8%', height: '8%' },
      { top: '8.6%', left: '46.6%', width: '8%', height: '8%' },
      { top: '8.6%', left: '78.9%', width: '8%', height: '8%' },
      { top: '7.3%', left: '77.8%', width: '8%', height: '8%' },
      { top: '7.3%', left: '45.1%', width: '8%', height: '8%' },
      { top: '7.3%', left: '46.6%', width: '8%', height: '8%' },
      { top: '7.3%', left: '78.9%', width: '8%', height: '8%' },
      { top: '7.3%', left: '77.8%', width: '8%', height: '8%' }
    ]
  },
  { 
    id: 'whiteboard', name: '电子白板', isDangerous: true, type: 'danger', tip: '危险！安装不牢固易掉落。',
    zones: [
      { top: '35%', left: '85%', width: '12%', height: '35%' }
    ]
  },
  { 
    id: 'bookcase', name: '高大书柜', isDangerous: true, type: 'danger', tip: '危险！易倾倒伤人。',
    zones: [
      { top: '59.6%', left: '53.4%', width: '12%', height: '25%' },
      { top: '42.4%', left: '30.5%', width: '12%', height: '25%' },
      { top: '54.0%', left: '63.4%', width: '12%', height: '25%' },
      { top: '44.3%', left: '51.0%', width: '5%', height: '5%' },
      { top: '57.1%', left: '51.9%', width: '5%', height: '5%' },
      { top: '55.9%', left: '62.7%', width: '5%', height: '5%' },
      { top: '57.8%', left: '42.5%', width: '5%', height: '5%' },
      { top: '40.9%', left: '30.3%', width: '5%', height: '5%' },
      { top: '40.9%', left: '30.3%', width: '5%', height: '5%' },
      { top: '40.4%', left: '51.1%', width: '5%', height: '5%' },
      { top: '33.2%', left: '50.8%', width: '5%', height: '5%' },
      { top: '33.5%', left: '53.2%', width: '5%', height: '5%' },
      { top: '40.4%', left: '51.7%', width: '5%', height: '5%' }
      ]
    },
  { 
    id: 'water', name: '饮水机', isDangerous: true, type: 'danger', tip: '危险！防倾倒与开水烫伤。',
    zones: [
      { top: '65%', left: '90%', width: '8%', height: '25%' }
    ]
  },
  { 
    id: 'window', name: '窗户玻璃', isDangerous: true, type: 'danger', tip: '危险！碎裂割伤。',
    zones: [
      { top: '30.5%', left: '79.6%', width: '5%', height: '5%' },
      { top: '35.2%', left: '80.5%', width: '5%', height: '5%' },
      { top: '26.0%', left: '76.0%', width: '5%', height: '5%' },
      { top: '35.4%', left: '75.8%', width: '5%', height: '5%' },
      { top: '27.4%', left: '86.1%', width: '5%', height: '5%' },
      { top: '36.1%', left: '86.5%', width: '5%', height: '5%' },
      { top: '46.5%', left: '75.9%', width: '5%', height: '5%' },
      { top: '46.8%', left: '80.9%', width: '5%', height: '5%' },
      { top: '25.0%', left: '56.9%', width: '5%', height: '5%' },
      { top: '38.3%', left: '60.8%', width: '5%', height: '5%' },
      { top: '46.8%', left: '58.9%', width: '5%', height: '5%' },
      { top: '36.4%', left: '36.7%', width: '5%', height: '5%' },
      { top: '27.1%', left: '37.5%', width: '5%', height: '5%' },
      { top: '25.7%', left: '37.6%', width: '5%', height: '5%' },
      { top: '40.5%', left: '14.7%', width: '5%', height: '5%' },
      { top: '42.4%', left: '20.6%', width: '5%', height: '5%' },
      { top: '46.7%', left: '19.8%', width: '5%', height: '5%' },
      { top: '48.7%', left: '15.7%', width: '5%', height: '5%' }
    ]
  },

  // ✅ 生命盾牌 (2个逻辑点)
  { 
    id: 'corner', name: '承重墙角', isDangerous: false, type: 'safe', tip: '安全！坚固结构支撑。',
    zones: [
      { top: '55%', left: '1%', width: '15%', height: '25%' },
      { top: '76%', left: '1.4%', width: '15%', height: '25%' }
    ]
  },
  { 
    id: 'desk', name: '课桌下方', isDangerous: false, type: 'safe', tip: '安全！有效避险空间。',
    zones: [
      { top: '65%', left: '15%', width: '15%', height: '20%' }, // 课桌群1
      { top: '65%', left: '45%', width: '15%', height: '20%' }, // 课桌群2
      { top: '65%', left: '65%', width: '15%', height: '20%' },  // 课桌群3
    ]
  },
]);

const foundItems = ref(new Set()); // 记录【右侧边栏】的逻辑大类进度（比如“吊灯”是否找到了）
const foundZones = ref(new Set()); // 🆕 记录【画面中】具体点击了哪一个区域
const currentFeedback = ref(null);

// 修正为：访问 targets.value.length，并确保逻辑准确
const isGameComplete = computed(() => {
  return foundItems.value.size === targets.value.length;
});
const showHint = () => {
  currentFeedback.value = {
    isDangerous: false,
    tip: '提示：请仔细观察教室中的“吊灯”、“窗户”、“储物柜”以及“墙角”四个位置！'
  };
};

const handleFind = (target, index) => {
  // 给每个独立的区域生成一个唯一的 ID，比如 "lamp-0", "lamp-1"
  const uniqueZoneId = `${target.id}-${index}`;

  // 如果这个具体的地方还没被点过
  if (!foundZones.value.has(uniqueZoneId)) {
    foundZones.value.add(uniqueZoneId); // 1. 在画面上点亮这一个图标
    
    if (!foundItems.value.has(target.id)) {
      foundItems.value.add(target.id);    // 2. 更新右侧栏总进度（同类只触发一次）
      // currentFeedback.value = target;  // 可选：如果要弹窗提示，可以在这里触发
      console.log("当前发现的类目数:", foundItems.value.size);
      console.log("预计总类目数:", targets.value.length);
    }
  }
};

// 🆕 别忘了修改重置函数，把这个新本子也清空
const resetGame = () => {
  foundItems.value.clear();
  foundZones.value.clear(); // 清空区域记录
  currentFeedback.value = null;
};
// 计算各类型已完成数量
const foundItemsCount = (type) => {
   return targets.value.filter(t => t.type === type && foundItems.value.has(t.id)).length;
};

// 获取各类型目标
const getTargetsByType = (type) => {
  return targets.value.filter(t => t.type === type);
};

onMounted(() => {
  // 在组件加载完成后，通过简单的 resize 触发浏览器重绘
  window.dispatchEvent(new Event('resize'));
});

// 🛠️ 临时调试代码：点击图片任意位置，在控制台输出百分比坐标
const getClickPercent = (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left; // 点击位置相对图片的 X 坐标
  const y = e.clientY - rect.top;  // 点击位置相对图片的 Y 坐标
  
  const leftPercent = ((x / rect.width) * 100).toFixed(1);
  const topPercent = ((y / rect.height) * 100).toFixed(1);
  
  console.log(`点击位置: top: '${topPercent}%', left: '${leftPercent}%'`);
  // 你可以用鼠标点击吊灯的左上角，控制台就会告诉你确切的 top 和 left 值！
};
</script>

<style>
@import './HazardGame.css';
@import '../assets/global.css';
</style>