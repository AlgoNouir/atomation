'use client'

import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Task, Dependency } from '@/types/gantt';
import { calculateTaskDuration, calculateCriticalPath } from '@/utils/gantt-utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { User } from '@/store/slices/userSlice';

interface GanttChartProps {
  onTaskUpdate: (updatedTask: Task) => void;
  theme: 'light' | 'dark';
}

const GanttChart: React.FC<GanttChartProps> = ({ onTaskUpdate, theme }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const projects = useSelector((state: RootState) => state.projects.projects);
  const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);
  const users = useSelector((state: RootState) => state.users.users);

  const milestone = projects.flatMap(p => p.milestones).find(m => m.id === selectedMilestone);
  const tasks = milestone ? milestone.tasks : [];

  const criticalPathTasks = useMemo(() => calculateCriticalPath(tasks), [tasks]);

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'To Do':
          return '#3b82f6'; // blue-500
        case 'In Progress':
          return '#facc15'; // yellow-400
        case 'Debt':
          return '#f87171'; // red-400
        case 'Done':
          return '#4ade80'; // green-400
        default:
          return '#9ca3af'; // gray-400
      }
    } else {
      switch (status) {
        case 'To Do':
          return '#2563eb'; // blue-600
        case 'In Progress':
          return '#d97706'; // yellow-600
        case 'Debt':
          return '#dc2626'; // red-600
        case 'Done':
          return '#16a34a'; // green-600
        default:
          return '#4b5563'; // gray-600
      }
    }
  };

  const getCurrentTime = () => {
    return new Date();
  };

  useEffect(() => {
    if (tasks.length === 0 || !svgRef.current) return;

    const margin = { top: 50, right: 30, bottom: 30, left: 200 };
    const width = 1200 - margin.left - margin.right;
    const height = tasks.length * 50;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const startDate = d3.min(tasks, d => new Date(d.startDate)) || new Date();
    const endDate = d3.max(tasks, d => new Date(d.deadline)) || new Date();

    // Create scales
    const timeScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, width]);

    const taskScale = d3.scaleBand()
      .domain(tasks.map(t => t.id))
      .range([0, height])
      .padding(0.4);

    // Draw time axis
    const timeAxis = d3.axisTop(timeScale)
      .ticks(d3.timeDay.every(1))
      .tickFormat(d3.timeFormat('%b %d'));

    svg.append('g')
      .attr('class', 'time-axis')
      .call(timeAxis)
      .attr('color', theme === 'dark' ? '#e5e7eb' : '#4b5563');

    // Draw grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(timeScale.ticks(d3.timeDay.every(1)))
      .enter()
      .append('line')
      .attr('x1', d => timeScale(d))
      .attr('x2', d => timeScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', theme === 'dark' ? '#374151' : '#e5e7eb')
      .attr('stroke-dasharray', '2,2');

    // Draw task bars
    const taskGroups = svg.selectAll('.task-group')
      .data(tasks)
      .enter()
      .append('g')
      .attr('class', 'task-group')
      .attr('transform', d => `translate(0,${taskScale(d.id)})`);

    // Task labels
    taskGroups.append('text')
      .attr('x', -10)
      .attr('y', taskScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', theme === 'dark' ? '#e5e7eb' : '#4b5563')
      .text(d => {
        const assignee = d.assignees ? users.find(u => u.id === d.assignees[0])?.name : 'Unassigned';
        return `${d.title} (${assignee})`;
      });

    // Task bars (start to due)
    taskGroups.append('rect')
      .attr('class', 'task-bar')
      .attr('x', d => timeScale(new Date(d.startDate)))
      .attr('y', 0)
      .attr('width', d => timeScale(new Date(d.dueDate)) - timeScale(new Date(d.startDate)))
      .attr('height', taskScale.bandwidth())
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', d => getStatusColor(d.status))
      .attr('stroke', d => d3.color(getStatusColor(d.status))?.darker().toString() || '#000000')
      .attr('stroke-width', 2);

    // Dotted rectangles (due to deadline)
    taskGroups.append('rect')
      .attr('class', 'deadline-bar')
      .attr('x', d => timeScale(new Date(d.dueDate)))
      .attr('y', 0)
      .attr('width', d => timeScale(new Date(d.deadline)) - timeScale(new Date(d.dueDate)))
      .attr('height', taskScale.bandwidth())
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', 'none')
      .attr('stroke', d => d3.color(getStatusColor(d.status))?.darker().toString() || '#000000')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    // Draw dependencies
    const drawDependency = (from: Task, to: Task, type: Dependency['type']) => {
      const fromX = timeScale(new Date(from.dueDate));
      const fromY = taskScale(from.id)! + taskScale.bandwidth() / 2;
      const toX = timeScale(new Date(to.startDate));
      const toY = taskScale(to.id)! + taskScale.bandwidth() / 2;

      const midX = (fromX + toX) / 2;

      const path = `M ${fromX} ${fromY} 
                    C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

      svg.append('path')
        .attr('d', path)
        .attr('stroke', theme === 'dark' ? '#9ca3af' : '#6b7280')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#arrowhead)');

      // Add dependency type label
      svg.append('text')
        .attr('x', midX)
        .attr('y', (fromY + toY) / 2)
        .attr('dy', -5)
        .attr('text-anchor', 'middle')
        .attr('fill', theme === 'dark' ? '#d1d5db' : '#4b5563')
        .attr('font-size', '10px')
        .text(type);
    };

    tasks.forEach(task => {
      task.dependencies.forEach(dep => {
        const fromTask = tasks.find(t => t.id === dep.from);
        if (fromTask) {
          drawDependency(fromTask, task, dep.type);
        }
      });
    });

    // Draw current time line
    const currentTime = getCurrentTime();
    if (currentTime >= startDate && currentTime <= endDate) {
      svg.append('line')
        .attr('x1', timeScale(currentTime))
        .attr('x2', timeScale(currentTime))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', theme === 'dark' ? '#e5e7eb' : '#000000')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      svg.append('text')
        .attr('x', timeScale(currentTime))
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', theme === 'dark' ? '#e5e7eb' : '#000000')
        .attr('font-size', '12px')
        .text('Now');
    }

    // Add arrowhead marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', theme === 'dark' ? '#9ca3af' : '#6b7280')
      .style('stroke', 'none');

  }, [tasks, criticalPathTasks, getCurrentTime, theme, users]);

  return (
    <div className={`overflow-x-auto bg-base-100`}>
      <svg ref={svgRef} className="gantt-chart"></svg>
    </div>
  );
};

export default GanttChart;

