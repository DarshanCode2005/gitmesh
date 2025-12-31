<template>
  <div v-if="!emptyData" class="cube-widget-chart" :class="componentType">
    <component
      :is="componentType"
      ref="chart"
      :data="data"
      v-bind="customChartOptions"
    />
  </div>
  <app-widget-empty v-else />
</template>

<script setup>
import {
  computed, onMounted, ref, shallowRef, onBeforeUnmount,
} from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { externalTooltipHandler } from '@/modules/report/tooltip';
import AppWidgetEmpty from '@/modules/widget/components/shared/widget-empty.vue';

const componentType = 'area-chart';

const emit = defineEmits(['on-view-more-click', 'on-highest-number-calculation']);
const props = defineProps({
  datasets: {
    type: Array,
    default: () => [],
  },
  resultSet: {
    type: null,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => {},
  },
  granularity: {
    type: String,
    required: true,
  },
  isGridMinMax: {
    type: Boolean,
    default: false,
  },
  showMinAsValue: {
    type: Boolean,
    default: false,
  },
  pivotModifier: {
    type: Function,
    default: () => {},
  },
});

const highestValue = ref(0);
const lowestValue = ref(0);
const dataset = ref({});
const cachedOptions = shallowRef(null);
const cachedData = shallowRef(null);
const lastDataHash = ref(null);

const loading = computed(
  () => !props.resultSet?.loadResponses,
);
const emptyData = ref(false);

const buildSeriesDataset = (d, index) => {
  const seriesDataset = {
    ...dataset.value,
    ...props.datasets[index],
  };

  // Default dataset colors
  const {
    pointHoverBorderColor,
    borderColor,
    backgroundColor,
  } = seriesDataset;

  // Colors to configure today on graph
  const grey = 'rgba(180,180,180)';
  const transparent = 'rgba(255,255,255,0)';

  // Add customization to data points and line segments
  // according to datapoint position
  return {
    ...seriesDataset,
    pointHoverBorderColor: (ctx) => {
      const isAfterPenultimatePoint = ctx.dataIndex >= d.length - 2;

      return isAfterPenultimatePoint
        ? grey
        : pointHoverBorderColor;
    },
    segment: {
      borderColor: (ctx) => {
        const isLastPoint = ctx.p1DataIndex === d.length - 1;

        return isLastPoint ? grey : borderColor;
      },
      backgroundColor: (ctx) => {
        const isLastPoint = ctx.p1DataIndex === d.length - 1;

        return isLastPoint ? transparent : backgroundColor;
      },
    },
  };
};

// Parse resultSet into data that can be consumed by area-chart component
const series = (resultSet) => {
  // For line & area charts
  const pivot = resultSet.chartPivot();

  if (props.pivotModifier) {
    props.pivotModifier(pivot);
  }

  const computedSeries = [];

  if (resultSet.loadResponses.length > 0) {
    resultSet.loadResponses.forEach((_, index) => {
      const prefix = resultSet.loadResponses.length === 1
        ? ''
        : `${index},`; // has more than 1 dataset
      const computedData = pivot.map((p) => [
        p.x,
        p[`${prefix}${props.datasets[index].measure}`] || 0,
      ]);

      highestValue.value = Math.max(...computedData.map((d) => d[1]));
      lowestValue.value = Math.min(...computedData.map((d) => d[1]));

      emit('on-highest-number-calculation', highestValue.value);
      computedSeries.push({
        name: props.datasets[index].name,
        data: computedData,
        ...{
          dataset: buildSeriesDataset(computedData, index),
        },
      });
    });
  }

  // Search for hidden datasets to add to the available series
  const hiddenDatasets = props.datasets
    .filter((d) => d.hidden)
    .map((d) => ({
      name: d.name,
      ...{
        dataset: d,
      },
    }));

  if (hiddenDatasets.length) {
    computedSeries.push(...hiddenDatasets);
  }

  if (!computedSeries.some((s) => !!s?.data?.length)) {
    emptyData.value = true;
  }

  return computedSeries;
};

const data = computed(() => {
  console.log(`[WIDGET-AREA-CRITICAL] data computed - loading: ${loading.value}, resultSet exists: ${!!props.resultSet}`);
  
  if (loading.value) {
    return [];
  }
  
  // IMPROVED: Create a hash of the actual data content to detect real changes
  let currentDataHash = null;
  try {
    if (props.resultSet && props.resultSet.loadResponses) {
      // Create a simple hash based on the data that actually matters
      const pivot = props.resultSet.chartPivot();
      currentDataHash = JSON.stringify({
        loadResponsesCount: props.resultSet.loadResponses.length,
        pivotLength: pivot.length,
        firstItem: pivot[0] || null,
        lastItem: pivot[pivot.length - 1] || null,
        datasets: props.datasets.map(d => ({ name: d.name, measure: d.measure })),
      });
    }
  } catch (e) {
    console.warn('[WIDGET-AREA-CRITICAL] Error creating data hash:', e);
    currentDataHash = Date.now().toString(); // Force recalculation if error
  }
  
  if (cachedData.value && lastDataHash.value === currentDataHash) {
    console.log(`[WIDGET-AREA-CRITICAL] data computed - using cached result (hash match)`);
    return cachedData.value;
  }
  
  console.log(`[WIDGET-AREA-CRITICAL] data computed - calculating new result (hash changed)`);
  console.log(`[WIDGET-AREA-CRITICAL] Old hash: ${lastDataHash.value}`);
  console.log(`[WIDGET-AREA-CRITICAL] New hash: ${currentDataHash}`);
  
  const result = series(props.resultSet);
  
  // Cache the result with the hash
  cachedData.value = result;
  lastDataHash.value = currentDataHash;
  
  return result;
});

const customChartOptions = computed(() => {
  console.log(`[WIDGET-AREA-CRITICAL] customChartOptions computed - highestValue: ${highestValue.value}, lowestValue: ${lowestValue.value}`);
  
  // IMPROVED: Create a simple hash of the inputs that matter
  const currentInputsHash = JSON.stringify({
    chartOptionsKeys: Object.keys(props.chartOptions || {}),
    highestValue: highestValue.value,
    lowestValue: lowestValue.value,
    isGridMinMax: props.isGridMinMax,
    showMinAsValue: props.showMinAsValue,
  });
  
  if (cachedOptions.value && cachedOptions.value.inputsHash === currentInputsHash) {
    console.log(`[WIDGET-AREA-CRITICAL] customChartOptions computed - using cached options`);
    return cachedOptions.value.result;
  }
  
  console.log(`[WIDGET-AREA-CRITICAL] customChartOptions computed - calculating new options`);
  const options = cloneDeep(props.chartOptions);

  // Customize external tooltip
  // Handle View more button click
  // Get dataPoint from tooltip and extract the date
  options.library.plugins.tooltip.external = (
    context,
  ) => externalTooltipHandler(context, () => {
    const point = context.tooltip.dataPoints.find(
      (p) => p.datasetIndex === 0,
    );
    const date = data.value[0].data[point.dataIndex][0];
    emit('on-view-more-click', date);
  });

  // Only show bottom and top grid lines by setting
  // the stepSize to be the maxValue
  if (props.isGridMinMax) {
    options.library.scales.y.max = highestValue.value;
    options.library.scales.y.ticks.stepSize = highestValue.value;
  }

  // Min value of the graph should be the min data point
  if (props.showMinAsValue) {
    if (lowestValue.value !== highestValue.value) {
      options.library.scales.y.min = lowestValue.value;
    } else if (lowestValue.value !== 0) {
      options.library.scales.y.afterBuildTicks = (axis) => {
        Object.assign(axis, {
          ticks: axis.ticks.filter((t) => t.value !== 0),
        });
      };
    }
  }
  
  // Cache the result
  cachedOptions.value = {
    inputsHash: currentInputsHash,
    result: options,
  };
  
  return options;
});

const paintDataSet = () => {
  const canvas = document.querySelector(
    '.cube-widget-chart canvas',
  );
  
  if (canvas && customChartOptions.value?.computeDataset) {
    dataset.value = customChartOptions.value.computeDataset(canvas);
  }
};

onMounted(async () => {
  console.log(`[WIDGET-AREA-CRITICAL] Component mounted - datasets: ${props.datasets.map(d => d.name).join(', ')}`);
  paintDataSet();
});

onBeforeUnmount(() => {
  console.log(`[WIDGET-AREA-CRITICAL] Component unmounting - datasets: ${props.datasets.map(d => d.name).join(', ')}`);
});
</script>

<script>
export default {
  name: 'AppWidgetArea',
};
</script>
