'use client'

import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Task, GanttData, Dependency } from '@/types/gantt';
import { calculateTaskDuration, calculateCriticalPath } from '@/utils/gantt-utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const GanttChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const projects = useSelector((state: RootState) => state.projects.projects);
  const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);

  const milestone = projects.flatMap(p => p.milestones).find(m => m.id === selectedMilestone);
  const tasks = milestone ? milestone.tasks : [];

  const criticalPathTasks = useMemo(() => calculateCriticalPath(tasks), [tasks]);

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
    const endDate = d3.max(tasks, d => new Date(d.dueDate)) || new Date();

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
      .call(timeAxis);

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
      .attr('stroke', '#e5e7eb')
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
      .text(d => `${d.title} (${d.assignees[0]})`);

    // Task bars
    taskGroups.append('rect')
      .attr('class', 'task-bar')
      .attr('x', d => timeScale(new Date(d.startDate)))
      .attr('y', 0)
      .attr('width', d => {
        const duration = calculateTaskDuration(d);
        return timeScale(new Date(new Date(d.startDate).getTime() + duration * 24 * 60 * 60 * 1000)) - timeScale(new Date(d.startDate));
      })
      .attr('height', taskScale.bandwidth())
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', d => criticalPathTasks.includes(d.id) ? '#ef4444' : '#3b82f6')
      .attr('stroke', d => criticalPathTasks.includes(d.id) ? '#dc2626' : '#2563eb')
      .attr('stroke-width', 2);

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
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#arrowhead)');

      // Add dependency type label
      svg.append('text')
        .attr('x', midX)
        .attr('y', (fromY + toY) / 2)
        .attr('dy', -5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#4b5563')
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
      .attr('fill', '#9ca3af')
      .style('stroke', 'none');

  }, [tasks, criticalPathTasks]);

  return (
    <div className="overflow-x-auto">
      <svg ref={svgRef} className="gantt-chart"></svg>
    </div>
  );
};

export default GanttChart;

