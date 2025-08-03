'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

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
                        step.completed ? "text-emerald-600" : step.active ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <div 
                        className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            step.completed 
                                ? "border-emerald-600 bg-emerald-600" 
                                : step.active 
                                    ? "border-primary bg-primary" 
                                    : "border-border bg-background"
                        )}
                    >
                        {step.completed ? (
                            <Check className="w-4 h-4 text-white" />
                        ) : (
                            <span className={cn(
                                "text-xs font-semibold",
                                step.active ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                                {index + 1}
                            </span>
                        )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{step.label}</span>
                </div>
            ))}
        </div>
    );
}