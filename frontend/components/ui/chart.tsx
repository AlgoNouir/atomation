"use client"

import * as React from "react"
import { BarChartIcon } from 'lucide-react'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts"

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
    config: {
        [key: string]: {
            label: string
            color: string
            icon?: React.ReactNode
        }
    }
}

export function ChartContainer({
    className,
    config,
    children,
    ...props
}: ChartProps) {
    return (
        <div className={`card bg-base-100 shadow-xl ${className}`} {...props}>
            <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <BarChartIcon className="h-4 w-4" />
                        <h2 className="card-title text-base font-normal">Chart</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        {Object.entries(config).map(([key, { label, color, icon }]) => (
                            <div key={key} className="flex items-center space-x-1">
                                {icon || <div className={`h-3 w-3 rounded-full ${color}`} />}
                                <span className="text-xs opacity-70">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}

interface ChartTooltipProps {
    active?: boolean
    payload?: Array<{ value: number }>
    label?: string
    config: {
        [key: string]: {
            label: string
            color: string
        }
    }
    hideLabel?: boolean
    indicator?: "dashed" | "solid"
}

export function ChartTooltip({
    active,
    payload,
    label,
    config,
    hideLabel = false,
    indicator = "solid",
}: ChartTooltipProps) {
    if (!active || !payload) {
        return null
    }

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-2">
                {!hideLabel && <div className="text-xs font-bold">{label}</div>}
                <div className="flex flex-col gap-1">
                    {payload.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className={`h-2 w-2 rounded-full ${config[item.dataKey as string]?.color}`}
                            />
                            <span className="text-xs font-bold">
                                {config[item.dataKey as string]?.label}
                            </span>
                            <span className="text-xs">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function ChartTooltipContent({
    active,
    payload,
    label,
    config,
    hideLabel = false,
    indicator = "solid",
}: ChartTooltipProps) {
    if (!active || !payload) {
        return null
    }

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-2">
                {!hideLabel && <div className="text-xs font-bold">{label}</div>}
                <div className="flex flex-col gap-1">
                    {payload.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className={`h-2 w-2 rounded-full ${config[item.dataKey as string]?.color}`}
                            />
                            <span className="text-xs font-bold">
                                {config[item.dataKey as string]?.label}
                            </span>
                            <span className="text-xs">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

