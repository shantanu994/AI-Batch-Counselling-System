const { getBatchPrediction } = require("./aiService");
const { getLocalBatchPrediction } = require("./localAiService");

function mapStudentToPredictionPayload(student) {
  return {
    student_id: student.id,
    academic_score: student.academic_score,
    attendance_percentage: student.attendance_percentage,
    learning_ability: student.learning_ability,
    behaviour_score: student.behaviour_score,
    interest_area: student.interest_area,
    goal_type: student.goal_type,
    backlogs: student.backlogs,
  };
}

async function generatePredictionForStudent(student) {
  const payload = mapStudentToPredictionPayload(student);

  try {
    const aiResponse = await getBatchPrediction(payload);
    return { ...aiResponse, source: "python_ai" };
  } catch (error) {
    return getLocalBatchPrediction(payload);
  }
}

module.exports = { generatePredictionForStudent };
