'use client';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
    steps: {
        label: string;
        completed: boolean;
        active: boolean;
    }[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
    return (
        <div className="flex justify-center space-x-4 mb-6">
            {steps.map((step, index) => (
                <div 
                    key={index}
                    className={cn(
                        "flex items-center space-x-2 transition-all duration-300",
                        step.completed ? "text-green-500" : step.active ? "text-blue-500" : "text-gray-400"
                    )}
                >
                    <div 
                        className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            step.completed 
                                ? "border-green-500 bg-green-500" 
                                : step.active 
                                    ? "border-blue-500 bg-blue-500" 
                                    : "border-gray-300"
                        )}
                    >
                        {step.completed ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <span className={cn(
                                "text-xs font-semibold",
                                step.active ? "text-white" : "text-gray-500"
                            )}>
                                {index + 1}
                            </span>
                        )}
                    </div>
                    <span className="text-sm font-medium">{step.label}</span>
                </div>
            ))}
        </div>
    );
}