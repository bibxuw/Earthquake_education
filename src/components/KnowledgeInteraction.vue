<template>
  <div class="knowledge-interaction-wrapper">
    
    <button class="info-btn-new" @click="showScienceModal = true">
      {{ buttonText }}
    </button>

    <transition name="fade">
      <div class="modal-overlay" v-if="showScienceModal" @click.self="showScienceModal = false">
        <div class="modal-card">
          <button class="close-btn" @click="showScienceModal = false">✖</button>
          
          <h2 class="modal-title">{{ modalTitle }}</h2>
          
          <div class="modal-body">
            <slot name="content"></slot>
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
            <textarea 
              v-model="inputText" 
              class="book-textarea" 
              :placeholder="inputModalTitle.includes('批注') ? '在这里写下你的学习心得...' : '有什么疑问？向 老师/同学 提问吧...'">
            </textarea>
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

<script setup>
import { ref } from 'vue';

// 接收外部传入的按钮名字和弹窗标题
defineProps({
  buttonText: {
    type: String,
    default: '💡 查看科普知识'
  },
  modalTitle: {
    type: String,
    default: '💡 科普小知识'
  }
});

// 内部逻辑状态
const showScienceModal = ref(false);
const showInputModal = ref(false);
const showToast = ref(false);

const inputModalTitle = ref('');
const inputText = ref('');
const toastMessage = ref('');

// 方法
const handleAddNote = () => { 
  showScienceModal.value = false;
  inputModalTitle.value = '📝 记录批注'; 
  inputText.value = ''; 
  showInputModal.value = true; 
};

const handleAskQuestion = () => { 
  showScienceModal.value = false;
  inputModalTitle.value = '❓ 互动提问'; 
  inputText.value = ''; 
  showInputModal.value = true; 
};

const handleSubmitInput = () => {
  if (!inputText.value.trim()) {
    triggerToast('内容不能为空哦！');
    return;
  }
  const msg = inputModalTitle.value.includes('批注') ? '心得记录成功！' : '提问已发布。';
  showInputModal.value = false;
  inputText.value = ''; 
  triggerToast(msg); 
};

const triggerToast = (msg) => {
  toastMessage.value = msg;
  showToast.value = true;
};
</script>

<style scoped>
/* ==========================================
   ☢️ 强制锁定弹窗容器：提供绝对定位坐标系
   ========================================== */
.modal-card, 
.book-page-modal {
  position: relative !important;
}

/* ==========================================
   ☢️ 强制锁定关闭按钮：粉碎一切居中与干扰
   ========================================== */
.close-btn {
  position: absolute !important;
  top: 15px !important;
  right: 20px !important;
  left: auto !important;     /* 彻底切断水平居中 */
  bottom: auto !important;
  margin: 0 !important;      /* 粉碎 margin: 0 auto 居中干扰 */
  transform: none !important;/* 粉碎位移居中干扰 */
  
  /* 确保按钮是一个固定大小的可点击区域，防止变形 */
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  
  background: transparent !important;
  border: none !important;
  font-size: 1.8rem !important;
  color: #94a3b8 !important;
  cursor: pointer !important;
  z-index: 9999 !important;  /* 永远在最顶层 */
}

.close-btn:hover {
  color: #ef4444 !important;
}
/* 由于样式已经放入 global.css，这里不需要重复写复杂的 CSS */
/* 只需要一个简单的包裹器防止样式污染 */
.knowledge-interaction-wrapper {
  display: inline-block;
}
</style>