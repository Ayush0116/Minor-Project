
import { buildCareerAnalysis } from "../career/career.service.js";

export function buildRoadmap(profile) {
  const analysis = buildCareerAnalysis(profile);

  const milestones = analysis.skills.map((skill, index) => ({
    id: `${index + 1}`,
    title: skill.name,
    estimatedHours: skill.estimatedHours,
    status: skill.status,
    priority: skill.priority,
    order: index + 1
  }));

  return {
    targetRole: analysis.targetRole,
    degree: analysis.degree,
    field: analysis.field,
    timelineMonths: analysis.timelineMonths,
    readinessPercentage: analysis.readinessPercentage,
    totalEstimatedHours: analysis.totalEstimatedHours,
    remainingEstimatedHours: analysis.remainingEstimatedHours,
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter(
      item => item.status === "completed"
    ).length,
    milestones
  };
}
