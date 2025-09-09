// components/PieChart.tsx
'use client'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

// <-- REGISTER CHART.JS ELEMENTS DI LUAR KOMPONEN
ChartJS.register(ArcElement, Tooltip, Legend)

export default function PieChart() {
  const data = {
    labels: ['A', 'B', 'C'],
    datasets: [{
      data: [10, 20, 30],
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
    }]
  }

  return <Doughnut data={data} />
}
