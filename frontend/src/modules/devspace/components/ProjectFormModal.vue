<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Create New Project"
    width="500px"
    destroy-on-close
  >
    <el-form label-position="top" :model="form" ref="formRef" :rules="rules">
      <el-form-item label="Project Name" prop="name">
        <el-input v-model="form.name" placeholder="My Project" />
      </el-form-item>
      
      <el-form-item label="Description" prop="description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3" 
          placeholder="Project description..."
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">Create Project</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'success']);
const store = useStore();

const loading = ref(false);
const formRef = ref(null);

const form = reactive({
  name: '',
  description: ''
});

const rules = {
  name: [{ required: true, message: 'Please enter a project name', trigger: 'blur' }]
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await store.dispatch('devspace/createProject', { ...form });
        ElMessage.success('Project created successfully');
        emit('success');
        emit('update:modelValue', false);
      } catch (error) {
        ElMessage.error(error.message || 'Failed to create project');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>
