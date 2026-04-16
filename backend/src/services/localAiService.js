function normalizeLearningScore(value) {
  const map = {
    Fast: 90,
    Moderate: 70,
    Slow: 45,
  };
  return map[value] ?? 60;
}

function assignBatch(finalScore, attendance, backlogs, behaviour) {
  if (attendance < 55 || backlogs >= 4 || behaviour < 45) {
    return "Special Monitoring Batch";
  }
  if (finalScore >= 80 && attendance >= 80 && backlogs <= 1) {
    return "Advanced Batch";
  }
  if (finalScore >= 60 && attendance >= 70) {
    return "Regular Batch";
  }
  return "Remedial Batch";
}

function getRiskLevel(finalScore, attendance, backlogs) {
  let points = 0;

  if (finalScore < 55) points += 2;
  else if (finalScore < 65) points += 1;

  if (attendance < 60) points += 2;
  else if (attendance < 75) points += 1;

  if (backlogs >= 3) points += 2;
  else if (backlogs >= 1) points += 1;

  if (points >= 5) return "High";
  if (points >= 3) return "Medium";
  return "Low";
}

function buildRecommendation(batch, interestArea, goalType, riskLevel) {
  const base = {
    "Advanced Batch": "Offer advanced projects and leadership mentoring.",
    "Regular Batch": "Maintain steady weekly coaching and progress tracking.",
    "Remedial Batch": "Provide bridge modules with weekly follow-up sessions.",
    "Special Monitoring Batch": "Start strict intervention and parent communication plan.",
  };

  const interestTrack =
    interestArea === "Technical"
      ? "Focus on coding and technical skill development."
      : "Focus on communication and aptitude development.";

  const goalTrack =
    goalType === "Placement"
      ? "Include placement-readiness milestones."
      : "Include higher-studies guidance and exam strategy.";

  const riskTrack = riskLevel === "High" ? "Immediate risk mitigation is required." : "Continue periodic monitoring.";

  return `${base[batch]} ${interestTrack} ${goalTrack} ${riskTrack}`;
}

function getLocalBatchPrediction(student) {
  const academic = Number(student.academic_score || 0);
  const attendance = Number(student.attendance_percentage || 0);
  const behaviour = Number(student.behaviour_score || 0);
  const backlogs = Number(student.backlogs || 0);
  const learning = normalizeLearningScore(student.learning_ability);

  const performanceWeighted = academic * 0.4;
  const attendanceWeighted = attendance * 0.2;
  const learningWeighted = learning * 0.2;
  const behaviourWeighted = behaviour * 0.2;

  const finalScore = performanceWeighted + attendanceWeighted + learningWeighted + behaviourWeighted;
  const predictedBatch = assignBatch(finalScore, attendance, backlogs, behaviour);
  const riskLevel = getRiskLevel(finalScore, attendance, backlogs);

  return {
    predicted_batch: predictedBatch,
    risk_level: riskLevel,
    recommendation: buildRecommendation(predictedBatch, student.interest_area, student.goal_type, riskLevel),
    score_breakdown: {
      performance_weighted: Number(performanceWeighted.toFixed(2)),
      attendance_weighted: Number(attendanceWeighted.toFixed(2)),
      learning_weighted: Number(learningWeighted.toFixed(2)),
      behaviour_weighted: Number(behaviourWeighted.toFixed(2)),
      final_score: Number(finalScore.toFixed(2)),
    },
    source: "local_fallback",
  };
}

module.exports = { getLocalBatchPrediction };
