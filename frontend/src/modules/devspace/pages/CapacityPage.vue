<template>
  <div class="capacity-page">
    <div class="page-header">
      <h1>Team Capacity</h1>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="to"
          start-placeholder="Start"
          end-placeholder="End"
          size="default"
          @change="fetchCapacity"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else>
      <!-- Capacity Overview Cards -->
      <div class="capacity-summary">
        <div class="summary-card">
          <div class="card-label">Total Capacity</div>
          <div class="card-value">{{ overview.totalCapacity || 0 }}h</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Allocated</div>
          <div class="card-value allocated">{{ overview.allocatedHours || 0 }}h</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Available</div>
          <div class="card-value available">{{ overview.availableHours || 0 }}h</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Utilization</div>
          <div class="card-value">{{ overview.utilizationPercent || 0 }}%</div>
        </div>
      </div>

      <!-- Team Member Capacity -->
      <div class="team-capacity">
        <h2>Team Members</h2>
        <div class="member-list">
          <div v-for="member in teamMembers" :key="member.id" class="member-card">
            <div class="member-header">
              <el-avatar :size="40">{{ member.name?.charAt(0) || 'U' }}</el-avatar>
              <div class="member-info">
                <div class="member-name">{{ member.name || 'Unknown' }}</div>
                <div class="member-role">{{ member.role || 'Team Member' }}</div>
              </div>
            </div>
            
            <div class="capacity-bar">
              <div class="bar-track">
                <div 
                  class="bar-fill" 
                  :style="{ width: `${Math.min(member.utilizationPercent || 0, 100)}%` }"
                  :class="getUtilizationClass(member.utilizationPercent)"
                ></div>
              </div>
              <span class="capacity-text">
                {{ member.allocatedHours || 0 }}/{{ member.capacity || 40 }}h
              </span>
            </div>


            <div class="member-issues">
              <div v-for="issue in (member.assignedIssues || []).slice(0, 3)" :key="issue.id" class="issue-chip">
                <span class="issue-key">{{ issue.issueKey }}</span>
                <span class="issue-points">{{ issue.storyPoints || 1 }}pts</span>
              </div>
              <div v-if="(member.assignedIssues || []).length > 3" class="more-issues">
                +{{ (member.assignedIssues || []).length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline View -->
      <div class="timeline-section">
        <h2>Weekly Timeline</h2>
        <div class="timeline-grid">
          <div v-for="day in timeline" :key="day.date" class="timeline-day">
            <div class="day-header">{{ formatDate(day.date) }}</div>
            <div class="day-items">
              <div v-for="item in day.assignments" :key="item.id" class="timeline-item">
                <span class="item-assignee">{{ item.userName }}</span>
                <span class="item-issue">{{ item.issueKey }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { useProject } from '@/modules/devspace/composables/useProject';
import DevtelService from '@/modules/devspace/services/devtel-api';

export default {
  name: 'CapacityPage',
  setup() {
    const { activeProjectId } = useProject();
    return { activeProjectId };
  },
  data() {
    return {
      loading: true,
      dateRange: null,
      overview: {},
      teamMembers: [],
      timeline: [],
    };
  },
  computed: {
    projectId() {
      return this.activeProjectId;
    },
  },
  mounted() {
    if (this.projectId) {
      this.fetchCapacity();
    }
  },
  methods: {
    async fetchCapacity() {
      if (!this.projectId) return;
      this.loading = true;
      try {
        const [capacityData, timelineData] = await Promise.all([
          DevtelService.getCapacityOverview(this.projectId),
          DevtelService.getCapacityTimeline(this.projectId),
        ]);
        
        // Backend returns { capacity: [...], workspace: {...} }
        const capacityArray = capacityData.capacity || [];
        
        // Transform capacity data to expected format
        this.teamMembers = capacityArray.map(item => ({
          id: item.user?.id,
          name: item.user?.fullName || 'Unknown',
          role: 'Team Member',
          allocatedHours: item.totalAllocatedHours || 0,
          capacity: 40, // Default 40h/week
          utilizationPercent: Math.round((item.totalAllocatedHours / 40) * 100),
          assignedIssues: item.assignments?.map(a => ({
            id: a.issueId,
            issueKey: `#${a.issueId}`,
            storyPoints: Math.ceil((a.allocatedHours || 0) / 4), // Estimate points from hours
          })) || [],
        }));
        
        // Calculate overview stats
        const totalCapacity = this.teamMembers.length * 40;
        const allocatedHours = this.teamMembers.reduce((sum, m) => sum + m.allocatedHours, 0);
        this.overview = {
          totalCapacity,
          allocatedHours,
          availableHours: totalCapacity - allocatedHours,
          utilizationPercent: Math.round((allocatedHours / totalCapacity) * 100),
        };
        
        // Transform timeline: backend returns {timeline: {"2024-01-15": {userId: {...}}}}
        const timelineObj = timelineData.timeline || {};
        this.timeline = Object.keys(timelineObj).map(date => ({
          date,
          assignments: Object.values(timelineObj[date]).flatMap(userDay => 
            (userDay.assignments || []).map(a => ({
              id: a.issueId,
              userName: userDay.user?.fullName || 'Unknown',
              issueKey: `#${a.issueId}`,
            }))
          ),
        }));
      } catch (e) {
        console.error('Failed to fetch capacity', e);
        this.$message.error('Failed to load capacity data');
      } finally {
        this.loading = false;
      }
    },
    getUtilizationClass(percent) {
      if (percent >= 100) return 'over';
      if (percent >= 80) return 'high';
      if (percent >= 50) return 'medium';
      return 'low';
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    },
  },
};
</script>

<style scoped>
.capacity-page {
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
.capacity-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.summary-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}
.card-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.card-value {
  font-size: 28px;
  font-weight: 700;
}
.card-value.allocated { color: var(--el-color-warning); }
.card-value.available { color: var(--el-color-success); }
.team-capacity h2 {
  font-size: 18px;
  margin-bottom: 16px;
}
.member-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.member-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
}
.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.member-name {
  font-weight: 600;
}
.member-role {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.capacity-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.bar-track {
  flex: 1;
  height: 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}
.bar-fill.low { background: var(--el-color-success); }
.bar-fill.medium { background: var(--el-color-primary); }
.bar-fill.high { background: var(--el-color-warning); }
.bar-fill.over { background: var(--el-color-danger); }
.capacity-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.member-issues {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.issue-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--el-fill-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}
.issue-key {
  font-weight: 500;
}
.issue-points {
  color: var(--el-text-color-secondary);
}
.more-issues {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  padding: 4px 8px;
}
.timeline-section {
  margin-top: 32px;
}
.timeline-section h2 {
  font-size: 18px;
  margin-bottom: 16px;
}
.timeline-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.timeline-day {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 12px;
  min-height: 120px;
}
.day-header {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
}
.timeline-item {
  font-size: 11px;
  padding: 4px 6px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  margin-bottom: 4px;
}
.item-assignee {
  font-weight: 500;
}
.item-issue {
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}
.loading-state {
  padding: 40px 0;
}
</style>
