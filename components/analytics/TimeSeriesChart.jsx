'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TimeSeriesChart({ title, data, labels, borderColor, backgroundColor }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          precision: 0,
        },
      },
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 2,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        hoverBorderWidth: 2,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: data,
        borderColor: borderColor || '#3b82f6',
        backgroundColor: (context) => {
          const bgColor = [
            'rgba(59, 130, 246, 0.1)',
            'rgba(59, 130, 246, 0.1)',
          ];
          if (!context.chart.chartArea) {
            return;
          }
          const { ctx, chartArea: { top, bottom } } = context.chart;
          const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
          gradientBg.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
          gradientBg.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradientBg;
        },
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: borderColor || '#3b82f6',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: borderColor || '#3b82f6',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[400px]">
      <Line options={options} data={chartData} />
    </div>
  );
}
