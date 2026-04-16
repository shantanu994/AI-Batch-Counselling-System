from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

WEIGHTS = {
    "performance": 0.40,
    "attendance": 0.20,
    "learning": 0.20,
    "behaviour": 0.20,
}


def normalize_learning_score(value: str) -> int:
    mapping = {
        "Fast": 90,
        "Moderate": 70,
        "Slow": 45,
    }
    return mapping.get(value, 60)


def categorize_attendance(value: float) -> str:
    if value >= 85:
        return "Regular"
    if value >= 70:
        return "Irregular"
    return "Low"


def categorize_academic(value: float) -> str:
    if value >= 80:
        return "High"
    if value >= 60:
        return "Average"
    return "Slow"


def assign_batch(score: float, attendance: float, backlogs: int, behaviour_score: float) -> str:
    if attendance < 55 or backlogs >= 4 or behaviour_score < 45:
        return "Special Monitoring Batch"
    if score >= 80 and attendance >= 80 and backlogs <= 1:
        return "Advanced Batch"
    if score >= 60 and attendance >= 70:
        return "Regular Batch"
    return "Remedial Batch"


def risk_level(score: float, attendance: float, backlogs: int) -> str:
    risk_points = 0
    if score < 55:
        risk_points += 2
    elif score < 65:
        risk_points += 1

    if attendance < 60:
        risk_points += 2
    elif attendance < 75:
        risk_points += 1

    if backlogs >= 3:
        risk_points += 2
    elif backlogs >= 1:
        risk_points += 1

    if risk_points >= 5:
        return "High"
    if risk_points >= 3:
        return "Medium"
    return "Low"


def build_recommendation(batch: str, interest_area: str, goal_type: str, risk: str) -> str:
    recommendations = {
        "Advanced Batch": "Offer advanced projects, mock interviews, and leadership mentoring.",
        "Regular Batch": "Maintain steady coaching with weekly assignments and monthly counselling.",
        "Remedial Batch": "Provide bridge modules, peer tutoring, and attendance recovery plan.",
        "Special Monitoring Batch": "Create strict intervention plan, parent communication, and frequent counselling.",
    }

    track = (
        "Focus on coding contests and internship prep."
        if interest_area == "Technical"
        else "Focus on communication, aptitude, and domain exposure."
    )

    goal = (
        "Include placement readiness milestones."
        if goal_type == "Placement"
        else "Include higher studies exam strategy and research orientation."
    )

    risk_line = "Immediate risk mitigation required." if risk == "High" else "Continue structured monitoring."

    return f"{recommendations[batch]} {track} {goal} {risk_line}"


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    payload = request.get_json(force=True)

    academic = float(payload.get("academic_score", 0))
    attendance = float(payload.get("attendance_percentage", 0))
    learning_ability = str(payload.get("learning_ability", "Moderate"))
    behaviour = float(payload.get("behaviour_score", 50))
    backlogs = int(payload.get("backlogs", 0))
    interest_area = str(payload.get("interest_area", "Technical"))
    goal_type = str(payload.get("goal_type", "Placement"))

    learning_score = normalize_learning_score(learning_ability)

    weighted_score = (
        academic * WEIGHTS["performance"]
        + attendance * WEIGHTS["attendance"]
        + learning_score * WEIGHTS["learning"]
        + behaviour * WEIGHTS["behaviour"]
    )

    batch = assign_batch(weighted_score, attendance, backlogs, behaviour)
    risk = risk_level(weighted_score, attendance, backlogs)

    recommendation = build_recommendation(batch, interest_area, goal_type, risk)

    response = {
        "predicted_batch": batch,
        "risk_level": risk,
        "recommendation": recommendation,
        "labels": {
            "academic": categorize_academic(academic),
            "attendance": categorize_attendance(attendance),
            "learning": learning_ability,
        },
        "score_breakdown": {
            "performance_weighted": round(academic * WEIGHTS["performance"], 2),
            "attendance_weighted": round(attendance * WEIGHTS["attendance"], 2),
            "learning_weighted": round(learning_score * WEIGHTS["learning"], 2),
            "behaviour_weighted": round(behaviour * WEIGHTS["behaviour"], 2),
            "final_score": round(weighted_score, 2),
        },
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
