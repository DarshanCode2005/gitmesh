<template>
  <div class="velocity-chart">
    <div class="chart-header">
      <h3>{{ title || 'Velocity Chart' }}</h3>
      <div class="velocity-avg">
        Avg: <strong>{{ averageVelocity }}</strong> pts/sprint
      </div>
    </div>
    <div class="chart-container" ref="chartContainer">
      <svg :width="width" :height="height" class="chart-svg">
        <!-- Grid lines -->
        <g class="grid">
          <line 
            v-for="(tick, i) in yTicks" 
            :key="'h-' + i"
            :x1="padding.left" 
            :x2="width - padding.right"
            :y1="yScale(tick)" 
            :y2="yScale(tick)"
            class="grid-line"
          />
        </g>
        
        <!-- Average line -->
        <line 
          v-if="data.length > 1"
          :x1="padding.left"
          :x2="width - padding.right"
          :y1="yScale(averageVelocity)"
          :y2="yScale(averageVelocity)"
          class="avg-line"
        />
        
        <!-- Bars -->
        <g class="bars">
          <g v-for="(sprint, i) in data" :key="'bar-' + i">
            <!-- Committed (background) -->
            <rect
              :x="barX(i)"
              :y="yScale(sprint.committed)"
              :width="barWidth"
              :height="height - padding.bottom - yScale(sprint.committed)"
              class="bar committed"
              rx="4"
            />
            <!-- Completed (foreground) -->
            <rect
              :x="barX(i)"
              :y="yScale(sprint.completed)"
              :width="barWidth"
              :height="height - padding.bottom - yScale(sprint.completed)"
              class="bar completed"
              rx="4"
              @mouseenter="showTooltip($event, sprint)"
              @mouseleave="hideTooltip"
            />
          </g>
        </g>
        
        <!-- X axis -->
        <g class="x-axis" :transform="`translate(0, ${height - padding.bottom})`">
          <line :x1="padding.left" :x2="width - padding.right" y1="0" y2="0" class="axis-line" />
          <g v-for="(sprint, i) in data" :key="'x-' + i" :transform="`translate(${barX(i) + barWidth / 2}, 0)`">
            <text y="20" text-anchor="middle" class="axis-label">{{ sprint.name }}</text>
          </g>
        </g>
        
        <!-- Y axis -->
        <g class="y-axis" :transform="`translate(${padding.left}, 0)`">
          <line :y1="padding.top" :y2="height - padding.bottom" x1="0" x2="0" class="axis-line" />
          <g v-for="(tick, i) in yTicks" :key="'y-' + i" :transform="`translate(0, ${yScale(tick)})`">
            <text x="-8" text-anchor="end" dominant-baseline="middle" class="axis-label">{{ tick }}</text>
          </g>
        </g>
      </svg>
    </div>
    
    <!-- Legend -->
    <div class="chart-legend">
      <span class="legend-item committed"><span class="dot"></span> Committed</span>
      <span class="legend-item completed"><span class="dot"></span> Completed</span>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-title">{{ tooltip.name }}</div>
      <div class="tooltip-row committed">Committed: {{ tooltip.committed }} pts</div>
      <div class="tooltip-row completed">Completed: {{ tooltip.completed }} pts</div>
      <div class="tooltip-row ratio">Ratio: {{ tooltip.ratio }}%</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VelocityChart',
  props: {
    title: String,
    data: {
      type: Array,
      default: () => [],
      // Each item: { name: 'Sprint 1', committed: 40, completed: 35 }
    },
  },
  data() {
    return {
      width: 600,
      height: 280,
      padding: { top: 20, right: 20, bottom: 50, left: 50 },
      tooltip: { visible: false, x: 0, y: 0, name: '', committed: 0, completed: 0, ratio: 0 },
    };
  },
  computed: {
    chartWidth() {
      return this.width - this.padding.left - this.padding.right;
    },
    chartHeight() {
      return this.height - this.padding.top - this.padding.bottom;
    },
    maxValue() {
      if (!this.data.length) return 50;
      return Math.max(...this.data.map(d => Math.max(d.committed, d.completed))) * 1.1;
    },
    barWidth() {
      const count = this.data.length || 1;
      const gap = 0.3;
      return (this.chartWidth / count) * (1 - gap);
    },
    yTicks() {
      const max = Math.ceil(this.maxValue / 10) * 10;
      const step = max / 5;
      return Array.from({ length: 6 }, (_, i) => Math.round(i * step));
    },
    averageVelocity() {
      if (!this.data.length) return 0;
      const total = this.data.reduce((sum, d) => sum + d.completed, 0);
      return Math.round(total / this.data.length);
    },
  },
  mounted() {
    this.resizeChart();
    window.addEventListener('resize', this.resizeChart);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeChart);
  },
  methods: {
    resizeChart() {
      if (this.$refs.chartContainer) {
        this.width = this.$refs.chartContainer.clientWidth || 600;
      }
    },
    barX(index) {
      const count = this.data.length || 1;
      const totalBarWidth = this.chartWidth / count;
      const gap = (totalBarWidth - this.barWidth) / 2;
      return this.padding.left + index * totalBarWidth + gap;
    },
    yScale(value) {
      const normalized = value / (this.maxValue || 1);
      return this.padding.top + this.chartHeight * (1 - normalized);
    },
    showTooltip(event, sprint) {
      const rect = this.$refs.chartContainer.getBoundingClientRect();
      this.tooltip = {
        visible: true,
        x: event.clientX - rect.left + 10,
        y: event.clientY - rect.top - 10,
        name: sprint.name,
        committed: sprint.committed,
        completed: sprint.completed,
        ratio: sprint.committed ? Math.round((sprint.completed / sprint.committed) * 100) : 0,
      };
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
  },
};
</script>

<style scoped>
.velocity-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.velocity-avg {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.velocity-avg strong {
  color: var(--el-color-primary);
}
.chart-container {
  position: relative;
  width: 100%;
}
.chart-svg {
  display: block;
}
.grid-line {
  stroke: var(--el-border-color-lighter);
  stroke-width: 1;
}
.axis-line {
  stroke: var(--el-border-color);
  stroke-width: 1;
}
.axis-label {
  font-size: 11px;
  fill: var(--el-text-color-secondary);
}
.avg-line {
  stroke: var(--el-color-warning);
  stroke-width: 2;
  stroke-dasharray: 8 4;
}
.bar {
  transition: opacity 0.2s;
}
.bar.committed {
  fill: var(--el-fill-color-dark);
}
.bar.completed {
  fill: var(--el-color-primary);
  cursor: pointer;
}
.bar.completed:hover {
  opacity: 0.8;
}
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
  font-size: 12px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-item .dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
.legend-item.committed .dot {
  background: var(--el-fill-color-dark);
}
.legend-item.completed .dot {
  background: var(--el-color-primary);
}
.chart-tooltip {
  position: absolute;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 10;
}
.tooltip-title {
  font-weight: 600;
  margin-bottom: 6px;
}
.tooltip-row {
  margin: 2px 0;
}
.tooltip-row.committed {
  color: var(--el-text-color-secondary);
}
.tooltip-row.completed {
  color: var(--el-color-primary);
}
.tooltip-row.ratio {
  color: var(--el-color-success);
  font-weight: 500;
}
</style>
