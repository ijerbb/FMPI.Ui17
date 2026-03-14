import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType, ChartOptions } from 'chart.js';
import {
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  PieController,
  PolarAreaController,
  RadarController,
  BubbleController,
  ScatterController
} from 'chart.js';
import { Chart } from 'chart.js';

// Register all chart components
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ArcElement,
  DoughnutController,
  PieController,
  PolarAreaController,
  RadarController,
  BubbleController,
  ScatterController,
  Title,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  // KPI Data
  kpiData = {
    totalSales: 2847500,
    totalPurchases: 1653200,
    productsSold: 15847,
    grossProfit: 1194300
  };

  // Top Products
  topProducts = [
    { name: 'Industrial Bearing X200', category: 'Bearings', sales: 4520 },
    { name: 'Hydraulic Pump HP-500', category: 'Hydraulics', sales: 3890 },
    { name: 'Steel Gear Set GS-45', category: 'Gears', sales: 3250 },
    { name: 'Electric Motor EM-750', category: 'Motors', sales: 2980 },
    { name: 'Pneumatic Valve PV-200', category: 'Valves', sales: 2650 }
  ];

  // Top Customers
  topCustomers = [
    { name: 'ABC Manufacturing Corp', type: 'Manufacturing', amount: 458900 },
    { name: 'XYZ Industrial Supply', type: 'Distribution', amount: 392500 },
    { name: 'Global Tech Industries', type: 'Technology', amount: 325800 },
    { name: 'Premier Engineering Ltd', type: 'Engineering', amount: 287600 },
    { name: 'Metro Construction Inc', type: 'Construction', amount: 245300 }
  ];

  // Top Vendors
  topVendors = [
    { name: 'Pacific Steel Suppliers', category: 'Raw Materials', amount: 523400 },
    { name: 'Asian Components Ltd', category: 'Parts', amount: 412800 },
    { name: 'Euro Tech Imports', category: 'Equipment', amount: 358900 },
    { name: 'Local Hardware Dist', category: 'Hardware', amount: 287500 },
    { name: 'Industrial Parts Co', category: 'Parts', amount: 245600 }
  ];

  // Sales vs Purchases Bar Chart
  public salesPurchasesChartType: ChartType = 'bar';
  public salesPurchasesChartData: ChartData<'bar'> = {
    labels: ['July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
      {
        data: [1850000, 2100000, 1950000, 2450000, 2680000, 2847500],
        label: 'Sales',
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1
      },
      {
        data: [1120000, 1350000, 1280000, 1480000, 1590000, 1653200],
        label: 'Purchases',
        backgroundColor: 'rgba(25, 135, 84, 0.8)',
        borderColor: 'rgba(25, 135, 84, 1)',
        borderWidth: 1
      }
    ]
  };
  public salesPurchasesChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => '₱' + (Number(value) / 1000000).toFixed(1) + 'M'
        }
      }
    }
  };

  // Category Pie Chart
  public categoryPieChartType: ChartType = 'doughnut';
  public categoryPiePieChartData: ChartData<'doughnut'> = {
    labels: ['Bearings', 'Hydraulics', 'Gears', 'Motors', 'Valves', 'Others'],
    datasets: [
      {
        data: [35, 25, 18, 12, 7, 3],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  public categoryPieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };
  get categoryPieChartData() {
    return this.categoryPiePieChartData;
  }

  // Sales Trend Line Chart
  public salesTrendChartType: ChartType = 'line';
  public salesTrendChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [1650000, 1720000, 1580000, 1890000, 1950000, 2100000, 1850000, 2100000, 1950000, 2450000, 2680000, 2847500],
        label: 'Monthly Sales',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };
  public salesTrendChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => '₱' + (Number(value) / 1000000).toFixed(1) + 'M'
        }
      }
    }
  };

  // Purchase Distribution Pie Chart
  public purchaseDistChartType: ChartType = 'pie';
  public purchaseDistChartData: ChartData<'pie'> = {
    labels: ['Raw Materials', 'Components', 'Equipment', 'Hardware', 'Services'],
    datasets: [
      {
        data: [40, 28, 18, 10, 4],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  public purchaseDistChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  constructor() {}

  ngOnInit(): void {}

  getGradient(percentage: number, color: string): string {
    return `conic-gradient(${color} ${percentage}%, #e9ecef ${percentage}%)`;
  }
}
