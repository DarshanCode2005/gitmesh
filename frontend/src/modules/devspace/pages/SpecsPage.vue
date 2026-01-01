<template>
  <div class="specs-page">
    <div class="page-header">
      <h1>Specs & Documentation</h1>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Search specs..."
          prefix-icon="Search"
          clearable
          style="width: 240px"
          @input="handleSearch"
        />
        <el-button type="primary" @click="showCreateModal = true">
          <el-icon><Plus /></el-icon>
          New Spec
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else>
      <div class="specs-grid">
        <div 
          v-for="spec in specs" 
          :key="spec.id" 
          class="spec-card"
          @click="openSpec(spec)"
        >
          <div class="spec-header">
            <el-icon class="spec-icon"><Document /></el-icon>
            <el-tag 
              :type="getStatusType(spec.status)" 
              size="small"
            >
              {{ spec.status }}
            </el-tag>
          </div>
          <h3 class="spec-title">{{ spec.title }}</h3>
          <p class="spec-preview">{{ getPreview(spec.content) }}</p>
          <div class="spec-footer">
            <div class="spec-author">
              <el-avatar :size="20">{{ spec.author?.name?.charAt(0) || 'A' }}</el-avatar>
              <span>{{ spec.author?.name || 'Unknown' }}</span>
            </div>
            <span class="spec-date">{{ formatDate(spec.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <div v-if="specs.length === 0" class="empty-state">
        <el-empty description="No specs yet">
          <el-button type="primary" @click="showCreateModal = true">Create First Spec</el-button>
        </el-empty>
      </div>
    </template>

    <!-- Create Modal -->
    <el-dialog v-model="showCreateModal" title="Create Spec" width="600px">
      <el-form :model="newSpec" label-position="top">
        <el-form-item label="Title" required>
          <el-input v-model="newSpec.title" placeholder="Spec title" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="newSpec.status" style="width: 100%">
            <el-option value="draft" label="Draft" />
            <el-option value="review" label="In Review" />
            <el-option value="approved" label="Approved" />
          </el-select>
        </el-form-item>
        <el-form-item label="Content">
          <el-input 
            v-model="newSpec.contentText" 
            type="textarea" 
            :rows="10"
            placeholder="Write your spec content here..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateModal = false">Cancel</el-button>
        <el-button type="primary" @click="createSpec" :loading="creating">Create</el-button>
      </template>
    </el-dialog>

    <!-- Spec Detail Drawer -->
    <el-drawer v-model="showSpecDrawer" :title="selectedSpec?.title" size="50%">
      <template v-if="selectedSpec">
        <div class="spec-detail">
          <div class="detail-meta">
            <el-tag :type="getStatusType(selectedSpec.status)">{{ selectedSpec.status }}</el-tag>
            <span>by {{ selectedSpec.author?.name }}</span>
            <span>•</span>
            <span>Updated {{ formatDate(selectedSpec.updatedAt) }}</span>
          </div>
          <div class="detail-content" v-html="renderContent(selectedSpec.content)"></div>
          
          <div class="comments-section">
            <h4>Comments ({{ specComments.length }})</h4>
            <div v-for="comment in specComments" :key="comment.id" class="comment">
              <el-avatar :size="32">{{ comment.author?.name?.charAt(0) }}</el-avatar>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author?.name }}</span>
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
              </div>
            </div>
            <div class="add-comment">
              <el-input v-model="newComment" type="textarea" :rows="2" placeholder="Add comment..." />
              <el-button type="primary" size="small" @click="addComment" :disabled="!newComment.trim()">
                Comment
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import { Document, Plus, Search } from '@element-plus/icons-vue';
import { useProject } from '@/modules/devspace/composables/useProject';
import DevtelService from '@/modules/devspace/services/devtel-api';

export default {
  name: 'SpecsPage',
  components: { Document, Plus, Search },
  setup() {
    const { activeProjectId } = useProject();
    return { activeProjectId };
  },
  data() {
    return {
      loading: true,
      specs: [],
      searchQuery: '',
      showCreateModal: false,
      showSpecDrawer: false,
      creating: false,
      selectedSpec: null,
      specComments: [],
      newComment: '',
      newSpec: {
        title: '',
        status: 'draft',
        contentText: '',
      },
    };
  },
  computed: {
    projectId() {
      return this.activeProjectId;
    },
  },
  mounted() {
    if (this.projectId) {
      this.fetchSpecs();
    }
  },
  methods: {
    async fetchSpecs() {
      if (!this.projectId) return;
      this.loading = true;
      try {
        const data = await DevtelService.listSpecs(this.projectId, { search: this.searchQuery });
        this.specs = data.rows || [];
      } catch (e) {
        console.error('Failed to fetch specs', e);
        this.$message.error('Failed to load specs');
      } finally {
        this.loading = false;
      }
    },
    async createSpec() {
      if (!this.newSpec.title) return;
      this.creating = true;
      try {
        const spec = await DevtelService.createSpec(this.projectId, {
          title: this.newSpec.title,
          status: this.newSpec.status,
          content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: this.newSpec.contentText }] }] },
        });
        this.specs.unshift(spec);
        this.showCreateModal = false;
        this.newSpec = { title: '', status: 'draft', contentText: '' };
      } catch (e) {
        console.error('Failed to create spec', e);
      } finally {
        this.creating = false;
      }
    },
    async openSpec(spec) {
      this.selectedSpec = spec;
      this.showSpecDrawer = true;
      this.specComments = [];
      // Fetch comments if needed
    },
    async addComment() {
      if (!this.newComment.trim() || !this.selectedSpec) return;
      // TODO: Add comment API call
      this.newComment = '';
    },
    handleSearch() {
      this.fetchSpecs();
    },
    getStatusType(status) {
      const types = { draft: 'info', review: 'warning', approved: 'success' };
      return types[status] || 'info';
    },
    getPreview(content) {
      if (!content) return '';
      if (typeof content === 'string') return content.substring(0, 150);
      // Extract text from Tiptap JSON
      const texts = [];
      const extract = (node) => {
        if (node.text) texts.push(node.text);
        if (node.content) node.content.forEach(extract);
      };
      extract(content);
      return texts.join(' ').substring(0, 150) + '...';
    },
    renderContent(content) {
      if (!content) return '';
      if (typeof content === 'string') return content.replace(/\n/g, '<br>');
      return this.getPreview(content);
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
  },
};
</script>

<style scoped>
.specs-page {
  padding: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.header-actions {
  display: flex;
  gap: 12px;
}
.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.spec-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.spec-card:hover {
  border-color: var(--el-color-primary);
  background-color: #18181b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.spec-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}
.spec-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}
.spec-preview {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.spec-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.spec-author {
  display: flex;
  align-items: center;
  gap: 6px;
}
.spec-detail {
  padding: 0 16px;
}
.detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.detail-content {
  line-height: 1.8;
  margin-bottom: 32px;
}
.comments-section h4 {
  margin-bottom: 16px;
}
.comment {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.comment-body {
  flex: 1;
}
.comment-header {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}
.comment-author {
  font-weight: 500;
}
.comment-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.comment-text {
  margin: 0;
  font-size: 14px;
}
.add-comment {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
.add-comment .el-button {
  align-self: flex-end;
}
.empty-state {
  padding: 60px 0;
}
.loading-state {
  padding: 40px 0;
}
</style>
