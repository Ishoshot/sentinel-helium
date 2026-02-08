import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Filler } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Filler)

/**
 * Demo chart data and options for the landing page mockup.
 * Uses the same Chart.js configuration patterns as the real dashboard
 * but with hardcoded demo data and mockup-specific dark theme colors.
 */

// ── Run Activity (Line Chart) ──────────────────────────────────────────────

export const runActivityData: ChartData = {
  labels: ['Jan 14', 'Jan 16', 'Jan 18', 'Jan 20', 'Jan 22', 'Jan 24', 'Jan 27', 'Jan 30'],
  datasets: [
    {
      label: 'Successful',
      data: [1, 2, 3, 5, 4, 6, 3, 2],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#10b981',
      pointHoverBorderColor: '#18181b',
      pointHoverBorderWidth: 2,
    },
    {
      label: 'Failed',
      data: [0, 1, 0, 1, 2, 1, 0, 1],
      borderColor: '#f43f5e',
      backgroundColor: 'rgba(244, 63, 94, 0.08)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#f43f5e',
      pointHoverBorderColor: '#18181b',
      pointHoverBorderWidth: 2,
    },
  ],
}

export const runActivityOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#52525b',
        font: { size: 10, family: 'Instrument Sans' },
      },
      border: { display: false },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(63, 63, 70, 0.2)' },
      ticks: {
        color: '#52525b',
        font: { size: 10, family: 'Instrument Sans' },
        precision: 0,
        padding: 6,
      },
      border: { display: false },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#a1a1aa',
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16,
        font: { size: 11, family: 'Instrument Sans' },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#18181b',
      titleColor: '#fafafa',
      bodyColor: '#a1a1aa',
      borderColor: '#27272a',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      displayColors: true,
      boxPadding: 4,
      titleFont: { size: 12, weight: 'bold' },
      bodyFont: { size: 11 },
    },
  },
  animation: {
    duration: 750,
    easing: 'easeOutQuart',
  },
}

// ── Findings by Severity (Doughnut Chart) ──────────────────────────────────

export const findingsDistributionData: ChartData = {
  labels: ['Critical', 'High', 'Medium', 'Low'],
  datasets: [
    {
      data: [3, 7, 9, 6],
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#3b82f6'],
      borderWidth: 2,
      borderColor: '#18181b',
      hoverOffset: 6,
    },
  ],
}

export const findingsDistributionOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        color: '#a1a1aa',
        padding: 14,
        usePointStyle: true,
        pointStyle: 'rectRounded',
        font: { size: 11, family: 'Instrument Sans' },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#18181b',
      titleColor: '#fafafa',
      bodyColor: '#a1a1aa',
      borderColor: '#27272a',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      displayColors: true,
      boxPadding: 4,
      titleFont: { size: 12, weight: 'bold' },
      bodyFont: { size: 11 },
    },
  },
  animation: {
    duration: 750,
    easing: 'easeOutQuart',
  },
}
