import React from "react";
import { Check, Clock, UserCheck, Play, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

const STEPS = [
    { key: "OPEN", label: "Open", icon: Clock },
    { key: "ASSIGNED", label: "Assigned", icon: UserCheck },
    { key: "IN_PROGRESS", label: "In Progress", icon: Play },
    { key: "RESOLVED", label: "Resolved", icon: CheckCircle2 },
    { key: "CLOSED", label: "Closed", icon: ShieldCheck }
];

export default function StatusStepper({ currentStatus }) {
    if (currentStatus === "CANCELLED") {
        return (
            <div className="status-stepper cancelled-stepper">
                <div className="stepper-cancelled-pill">
                    <XCircle size={16} />
                    <span>This ticket has been cancelled</span>
                </div>
            </div>
        );
    }

    const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);

    return (
        <div className="status-stepper">
            <div className="stepper-track">
                {STEPS.map((step, index) => {
                    const isCompleted = currentIndex > index;
                    const isCurrent = currentIndex === index;
                    const isPending = currentIndex < index;
                    const StepIcon = step.icon;

                    let stepClass = "stepper-step";
                    if (isCompleted) stepClass += " completed";
                    if (isCurrent) stepClass += " active";
                    if (isPending) stepClass += " pending";

                    return (
                        <React.Fragment key={step.key}>
                            <div className={stepClass}>
                                <div className="step-node">
                                    {isCompleted ? (
                                        <Check size={14} className="node-icon" />
                                    ) : (
                                        <StepIcon size={14} className="node-icon" />
                                    )}
                                </div>
                                <span className="step-label">{step.label}</span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`step-connector ${
                                        isCompleted ? "completed" : ""
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
