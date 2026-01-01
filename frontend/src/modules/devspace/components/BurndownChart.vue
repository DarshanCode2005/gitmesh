<template>
  <div class="burndown-chart">
    <div class="chart-header">
      <h3>{{ title || 'Burndown Chart' }}</h3>
      <div class="chart-legend">
        <span class="legend-item ideal"><span class="dot"></span> Ideal</span>
        <span class="legend-item actual"><span class="dot"></span> Actual</span>
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
        
        <!-- Ideal line -->
        <path 
          :d="idealPath" 
          class="line ideal-line"
          fill="none"
        />
        
        <!-- Actual line -->
        <path 
          :d="actualPath" 
          class="line actual-line"
          fill="none"
        />
        
        <!-- Data points -->
        <g class="data-points">
          <circle 
            v-for="(point, i) in actualPoints" 
            :key="'p-' + i"
            :cx="xScale(i)"
            :cy="yScale(point.remaining)"
            r="4"
            class="point"
            @mouseenter="showTooltip($event, point)"
            @mouseleave="hideTooltip"
          />
        </g>
        
        <!-- X axis -->
        <g class="x-axis" :transform="`translate(0, ${height - padding.bottom})`">
          <line :x1="padding.left" :x2="width - padding.right" y1="0" y2="0" class="axis-line" />
          <g v-for="(label, i) in xLabels" :key="'x-' + i" :transform="`translate(${xScale(i)}, 0)`">
            <text y="20" text-anchor="middle" class="axis-label">{{ label }}</text>
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
    
    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-date">{{ tooltip.date }}</div>
      <div class="tooltip-value">{{ tooltip.remaining }} points remaining</div>
      <div class="tooltip-completed">{{ tooltip.completed }} completed</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BurndownChart',
  props: {
    title: String,
    data: {
      type: Array,
      default: () => [],
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      width: 600,
      height: 300,
      padding: { top: 20, right: 20, bottom: 40, left: 50 },
      tooltip: { visible: false, x: 0, y: 0, date: '', remaining: 0, completed: 0 },
    };
  },
  computed: {
    chartWidth() {
      return this.width - this.padding.left - this.padding.right;
    },
    chartHeight() {
      return this.height - this.padding.top - this.padding.bottom;
    },
    maxPoints() {
      return this.totalPoints || Math.max(...this.data.map(d => d.remaining), 1);
    },
    xLabels() {
      return this.data.map(d => this.formatDate(d.date));
    },
    yTicks() {
      const max = this.maxPoints;
      const step = Math.ceil(max / 5);
      return Array.from({ length: 6 }, (_, i) => i * step).filter(v => v <= max + step);
    },
    actualPoints() {
      return this.data;
    },
    idealPath() {
      if (!this.data.length) return '';
      const points = this.data.map((_, i) => {
        const idealRemaining = this.maxPoints - (this.maxPoints / (this.data.length - 1)) * i;
        return `${this.xScale(i)},${this.yScale(Math.max(0, idealRemaining))}`;
      });
      return `M ${points.join(' L ')}`;
    },
    actualPath() {
      if (!this.data.length) return '';
      const points = this.data.map((d, i) => `${this.xScale(i)},${this.yScale(d.remaining)}`);
      return `M ${points.join(' L ')}`;
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
    xScale(index) {
      const step = this.chartWidth / Math.max(this.data.length - 1, 1);
      return this.padding.left + index * step;
    },
    yScale(value) {
      const normalized = value / (this.maxPoints || 1);
      return this.padding.top + this.chartHeight * (1 - normalized);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },
    showTooltip(event, point) {
      const rect = this.$refs.chartContainer.getBoundingClientRect();
      this.tooltip = {
        visible: true,
        x: event.clientX - rect.left + 10,
        y: event.clientY - rect.top - 10,
        date: this.formatDate(point.date),
        remaining: point.remaining,
        completed: this.maxPoints - point.remaining,
      };
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
  },
};
</script>

<style scoped>
.burndown-chart {
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
.chart-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.legend-item.ideal .dot {
  background: var(--el-color-info-light-3);
}
.legend-item.actual .dot {
  background: var(--el-color-primary);
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
.line {
  stroke-width: 2;
}
.ideal-line {
  stroke: var(--el-color-info-light-3);
  stroke-dasharray: 5 5;
}
.actual-line {
  stroke: var(--el-color-primary);
}
.point {
  fill: var(--el-color-primary);
  cursor: pointer;
  transition: r 0.2s;
}
.point:hover {
  r: 6;
}
.chart-tooltip {
  position: absolute;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 10;
}
.tooltip-date {
  font-weight: 600;
  margin-bottom: 4px;
}
.tooltip-value {
  color: var(--el-color-primary);
}
.tooltip-completed {
  color: var(--el-color-success);
}
</style>
