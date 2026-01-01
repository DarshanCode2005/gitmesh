<template>
  <div class="team-page">
    <div class="page-header">
      <h1>Team</h1>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Search members..."
          prefix-icon="Search"
          clearable
          style="width: 200px"
          @input="handleSearch"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else>
      <!-- Team Stats -->
      <div class="team-stats">
        <div class="stat-card">
          <div class="stat-value">{{ teamMembers.length }}</div>
          <div class="stat-label">Team Members</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ analytics.issuesCompleted || 0 }}</div>
          <div class="stat-label">Issues Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ analytics.avgVelocity || 0 }}</div>
          <div class="stat-label">Avg Velocity</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ analytics.avgCycleTime || 0 }}d</div>
          <div class="stat-label">Avg Cycle Time</div>
        </div>
      </div>

      <!-- Team Grid -->
      <div class="team-grid">
        <div v-for="member in filteredMembers" :key="member.id" class="member-card">
          <div class="member-avatar">
            <el-avatar :size="64">{{ member.name?.charAt(0) || 'U' }}</el-avatar>
          </div>
          <div class="member-info">
            <h3 class="member-name">{{ member.name || 'Unknown' }}</h3>
            <p class="member-email">{{ member.email }}</p>
          </div>
          
          <div class="member-skills">
            <el-tag 
              v-for="skill in member.skills?.slice(0, 3)" 
              :key="skill.id"
              size="small"
              type="info"
            >
              {{ skill.skill }}
            </el-tag>
            <span v-if="member.skills?.length > 3" class="more-skills">
              +{{ member.skills.length - 3 }}
            </span>
          </div>

          <div class="member-stats">
            <div class="stat">
              <span class="stat-num">{{ member.issueStats?.completed || 0 }}</span>
              <span class="stat-label">Done</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ member.issueStats?.inProgress || 0 }}</span>
              <span class="stat-label">Active</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ member.issueStats?.total || 0 }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>

          <div class="member-actions">
            <el-button size="small" @click="viewProfile(member)">View Profile</el-button>
          </div>
        </div>
      </div>

      <div v-if="filteredMembers.length === 0" class="empty-state">
        <el-empty description="No team members found" />
      </div>
    </template>

    <!-- Profile Drawer -->
    <el-drawer v-model="showProfileDrawer" :title="selectedMember?.name" size="400px">
      <template v-if="selectedMember">
        <div class="profile-content">
          <div class="profile-header">
            <el-avatar :size="80">{{ selectedMember.name?.charAt(0) }}</el-avatar>
            <div class="profile-info">
              <h3>{{ selectedMember.name }}</h3>
              <p>{{ selectedMember.email }}</p>
            </div>
          </div>

          <div class="profile-section">
            <h4>Skills</h4>
            <div class="skills-list">
              <el-tag 
                v-for="skill in selectedMember.skills" 
                :key="skill.id"
                size="default"
                :type="getLevelType(skill.level)"
              >
                {{ skill.skill }} ({{ skill.level }})
              </el-tag>
            </div>
          </div>

          <div class="profile-section">
            <h4>Statistics</h4>
            <div class="profile-stats">
              <div class="profile-stat">
                <span class="value">{{ selectedMember.issueStats?.completed || 0 }}</span>
                <span class="label">Completed</span>
              </div>
              <div class="profile-stat">
                <span class="value">{{ selectedMember.issueStats?.inProgress || 0 }}</span>
                <span class="label">In Progress</span>
              </div>
              <div class="profile-stat">
                <span class="value">{{ selectedMember.issueStats?.avgPoints || 0 }}</span>
                <span class="label">Avg Points</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import { useProject } from '@/modules/devspace/composables/useProject';
import DevtelService from '@/modules/devspace/services/devtel-api';

export default {
  name: 'TeamPage',
  setup() {
    const { activeProjectId } = useProject();
    return { activeProjectId };
  },
  data() {
    return {
      loading: true,
      teamMembers: [],
      analytics: {},
      searchQuery: '',
      showProfileDrawer: false,
      selectedMember: null,
    };
  },
  computed: {
    projectId() {
      return this.activeProjectId;
    },
    filteredMembers() {
      if (!this.searchQuery) return this.teamMembers;
      const q = this.searchQuery.toLowerCase();
      return this.teamMembers.filter(m => 
        m.name?.toLowerCase().includes(q) || 
        m.email?.toLowerCase().includes(q)
      );
    },
  },
  mounted() {
    if (this.projectId) {
      this.fetchTeam();
    }
  },
  methods: {
    async fetchTeam() {
      if (!this.projectId) return;
      this.loading = true;
      try {
        const [membersData, analyticsData] = await Promise.all([
          DevtelService.listTeamMembers(this.projectId),
          DevtelService.getTeamAnalytics(this.projectId),
        ]);
        
        // Backend returns { team: [...] }
        this.teamMembers = membersData.team || [];
        
        // Transform analytics data
        this.analytics = {
          issuesCompleted: analyticsData.totalCompleted || 0,
          avgVelocity: Math.round(analyticsData.totalPoints / 4) || 0, // Avg per week
          avgCycleTime: 5, // TODO: Calculate from actual data when available
        };
      } catch (e) {
        console.error('Failed to fetch team', e);
        this.$message.error('Failed to load team data');
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      // Local filter, no API call needed
    },
    viewProfile(member) {
      this.selectedMember = member;
      this.showProfileDrawer = true;
    },
    getLevelType(level) {
      const types = { beginner: 'info', intermediate: '', advanced: 'success', expert: 'warning' };
      return types[level] || '';
    },
  },
};
</script>

<style scoped>
.team-page {
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
.team-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.stat-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}
.stat-card .stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-color-primary);
}
.stat-card .stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.member-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.member-avatar {
  margin-bottom: 12px;
}
.member-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}
.member-email {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.member-skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
  min-height: 24px;
}
.more-skills {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.member-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.member-stats .stat {
  text-align: center;
}
.member-stats .stat-num {
  display: block;
  font-size: 18px;
  font-weight: 600;
}
.member-stats .stat-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.member-actions {
  margin-top: 8px;
}
.profile-content {
  padding: 0 16px;
}
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}
.profile-info {
  text-align: center;
  margin-top: 12px;
}
.profile-info h3 {
  margin: 0 0 4px;
}
.profile-info p {
  margin: 0;
  color: var(--el-text-color-secondary);
}
.profile-section {
  margin-bottom: 24px;
}
.profile-section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
}
.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.profile-stats {
  display: flex;
  gap: 20px;
}
.profile-stat {
  text-align: center;
}
.profile-stat .value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.profile-stat .label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.empty-state, .loading-state {
  padding: 60px 0;
}
</style>
