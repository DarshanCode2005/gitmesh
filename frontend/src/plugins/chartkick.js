import { v4 as uuid } from 'uuid';
import Chartkick from 'chartkick';
import {
  Chart,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  ArcElement,
  PieController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Legend,
  Title,
  Tooltip,
  SubTitle,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-moment';
import { h, watch } from 'vue';
import annotationPlugin from 'chartjs-plugin-annotation';
import {
  backgroundChartPlugin,
  verticalTodayBlockPlugin,
  verticalHoverLinePlugin,
  updateTicksLabelsPositionPlugin,
} from './chartkick-custom-plugins';
import {
  CustomLogarithmicScale,
} from './chartkick-custom-scales';

Chart.register(
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  ArcElement,
  PieController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Legend,
  Title,
  Tooltip,
  SubTitle,
  Filler,
  verticalTodayBlockPlugin,
  verticalHoverLinePlugin,
  updateTicksLabelsPositionPlugin,
  backgroundChartPlugin,
  annotationPlugin,
  CustomLogarithmicScale,
);

const createComponent = (app, tagName, ChartType) => {
  const chartProps = [
    'bytes',
    'code',
    'colors',
    'curve',
    'decimal',
    'discrete',
    'donut',
    'download',
    'empty',
    'label',
    'messages',
    'points',
    'prefix',
    'refresh',
    'stacked',
    'suffix',
    'thousands',
    'title',
    'xtitle',
    'ytitle',
    'zeros',
  ];
  app.component(tagName, {
    props: {
      data: {
        type: Array,
        default: () => [],
      },
      id: {
        type: String,
        default: () => uuid(),
      },
      width: {
        type: String,
        default: null,
      },
      height: {
        type: String,
        default: null,
      },
      dataset: {
        type: Object,
        default: undefined,
      },
      library: {
        type: Object,
        default: undefined,
      },
      loading: {
        type: String,
        default: undefined,
      },
      precision: {
        type: String,
        default: undefined,
      },
      round: {
        type: String,
        default: undefined,
      },
      min: {
        type: String,
        default: undefined,
      },
      max: {
        type: String,
        default: undefined,
      },
      xmax: {
        type: String,
        default: undefined,
      },
      xmin: {
        type: String,
        default: undefined,
      },
      legend: {
        type: Boolean,
        default: true,
      },
      ...chartProps.reduce((acc, item) => {
        acc[item] = {
          type: [String, Number, Boolean, Array],
          default: null,
        };
        return acc;
      }, {}),
    },
    data() {
      return {
        chartId: null,
        renderCount: 0,
        updateCount: 0,
        lastUpdateTime: null,
      };
    },
    computed: {
      chartStyle() {
        console.log(`[CHARTKICK-CRITICAL] chartStyle computed - ID: ${this.chartId}, renderCount: ${this.renderCount}`);
        
        // REMOVED THE HACK: This was likely causing the infinite re-renders
        // The original hack was watching data and options in the computed property
        // which would cause this computed to re-run every time data changed
        // causing the template to re-render, causing updated() to fire
        
        // OLD PROBLEMATIC CODE:
        // // hack to watch data and options
        // // eslint-disable-next-line no-unused-expressions
        // this.data;
        // // eslint-disable-next-line no-unused-expressions
        // this.chartOptions;

        return {
          height: this.height || '300px',
          lineHeight: this.height || '300px',
          width: this.width || '100%',
          textAlign: 'center',
          color: '#999',
          fontSize: '14px',
          fontFamily:
            "'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif",
        };
      },
      chartOptions() {
        console.log(`[CHARTKICK-CRITICAL] chartOptions computed - ID: ${this.chartId}, options keys:`, Object.keys(this.getChartOptions()));
        
        return this.getChartOptions();
      },
    },
    created() {
      this.chartId = this.chartId || this.id;
    },
    mounted() {
      console.log(`[CHARTKICK-CRITICAL] Component mounted - ID: ${this.chartId}`);
      this.updateChart();
      
      // IMPROVED: More stable watcher that doesn't trigger on every tiny change
      this.unwatchData = watch(
        () => {
          // Create a stable representation of the data and options
          const dataHash = this.data ? JSON.stringify(this.data).substring(0, 100) : null;
          const optionsHash = JSON.stringify(Object.keys(this.chartOptions || {}));
          return `${dataHash}|${optionsHash}`;
        },
        (newHash, oldHash) => {
          if (newHash !== oldHash) {
            console.log(`[CHARTKICK-CRITICAL] Watch triggered - ID: ${this.chartId}, hash changed from ${oldHash} to ${newHash}`);
            this.updateChart();
          }
        },
        { 
          deep: false, // Don't do deep watching since we're creating our own hash
          flush: 'post' // Run after DOM updates
        }
      );
    },
    updated() {
      this.renderCount++;
      const now = Date.now();
      const timeSinceLastUpdate = this.lastUpdateTime ? now - this.lastUpdateTime : 0;
      
      console.error(`[CHARTKICK-CRITICAL] Component updated - ID: ${this.chartId}, renderCount: ${this.renderCount}, timeSinceLastUpdate: ${timeSinceLastUpdate}ms`);
      
      if (timeSinceLastUpdate < 100 && this.renderCount > 5) {
        console.error(`[CHARTKICK-INFINITE-LOOP] Potential infinite loop detected! ID: ${this.chartId}, renderCount: ${this.renderCount}, rapid updates detected`);
        console.trace('Stack trace for infinite loop detection');
        return; // Prevent further updates to break the loop
      }
      
      // FIXED: Remove updateChart() call from updated() hook to prevent infinite loop
      // The chart should only be updated when props actually change, not on every render
      // this.updateChart();
    },
    beforeUnmount() {
      console.log(`[CHARTKICK-CRITICAL] Component beforeUnmount - ID: ${this.chartId}, final renderCount: ${this.renderCount}, final updateCount: ${this.updateCount}`);
      
      // FIXED: Clean up the watcher to prevent memory leaks
      if (this.unwatchData) {
        this.unwatchData();
      }
      
      if (this.chart) {
        this.chart.destroy();
      }
    },
    methods: {
      getChartOptions() {
        const options = {};
        const props = Object.keys(this.$props);
        for (let i = 0; i < props.length; i += 1) {
          const prop = props[i];
          if (this[prop] !== undefined) {
            options[prop] = this[prop];
          }
        }
        
        // FIXED: Disable Chart.js responsive behavior to prevent resize loops
        if (options.library && options.library.responsive !== false) {
          options.library.responsive = false;
          options.library.maintainAspectRatio = false;
        }
        
        return options;
      },
      updateChart() {
        this.updateCount++;
        this.lastUpdateTime = Date.now();
        
        console.log(`[CHARTKICK-CRITICAL] updateChart called - ID: ${this.chartId}, updateCount: ${this.updateCount}, hasChart: ${!!this.chart}, hasData: ${!!this.data}`);
        
        if (this.data !== null) {
          if (this.chart) {
            console.log(`[CHARTKICK-CRITICAL] Updating existing chart - ID: ${this.chartId}`);
            this.chart.updateData(
              this.data,
              this.chartOptions,
            );
          } else {
            console.log(`[CHARTKICK-CRITICAL] Creating new chart - ID: ${this.chartId}`);
            this.chart = new ChartType(
              this.chartId,
              this.data,
              this.chartOptions,
            );
          }
        } else if (this.chart) {
          console.log(`[CHARTKICK-CRITICAL] Destroying chart (no data) - ID: ${this.chartId}`);
          this.chart.destroy();
          this.chart = null;
          this.$el.innerText = 'Loading...';
        }
      },
    },
    render() {
      // check if undefined so works with empty string
      const loading = this.chartOptions.loading !== undefined
        ? this.chartOptions.loading
        : 'Loading...';

      // h() accepts VNodes,
      // but limit to string since it may be used by Chartkick.js
      if (typeof loading !== 'string') {
        throw new Error('loading must be a string');
      }

      return h(
        'div',
        {
          id: this.chartId,
          style: this.chartStyle,
        },
        [loading],
      );
    },
  });
};

Chartkick.install = (app) => {
  Chartkick.addAdapter(Chart);
  createComponent(app, 'line-chart', Chartkick.LineChart);
  createComponent(app, 'pie-chart', Chartkick.PieChart);
  createComponent(
    app,
    'column-chart',
    Chartkick.ColumnChart,
  );
  createComponent(app, 'bar-chart', Chartkick.BarChart);
  createComponent(app, 'area-chart', Chartkick.AreaChart);
  createComponent(
    app,
    'scatter-chart',
    Chartkick.ScatterChart,
  );
  createComponent(app, 'geo-chart', Chartkick.GeoChart);
  createComponent(app, 'timeline', Chartkick.Timeline);
};

export default Chartkick;
