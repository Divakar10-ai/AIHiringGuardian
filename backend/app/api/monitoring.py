from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, Any
from app.core.deps import get_db, get_current_user
from app.models.all import Evaluation, HumanReview, AuditLog

router = APIRouter()

@router.get("/metrics")
def get_monitoring_metrics(db: Session = Depends(get_db), current_user = Depends(get_current_user)) -> Dict[str, Any]:
    # 1. AI Recommendation Distribution
    recommendations = db.query(Evaluation.recommendation, func.count(Evaluation.id)).group_by(Evaluation.recommendation).all()
    rec_dist = [{"name": r[0] if r[0] else "Unknown", "value": r[1]} for r in recommendations]
    if not rec_dist:
        rec_dist = [] # Handle empty
        
    # 2. Overrides over time (last 7 days)
    # SQLite datetime functions can be tricky, so we'll do it in python for simplicity and compatibility
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_reviews = db.query(HumanReview).filter(HumanReview.reviewed_at >= seven_days_ago).all()
    
    # Group by date string 'YYYY-MM-DD'
    override_by_date = {}
    total_by_date = {}
    
    for i in range(7):
        d = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
        override_by_date[d] = 0
        total_by_date[d] = 0
        
    for review in recent_reviews:
        d = review.reviewed_at.strftime('%Y-%m-%d')
        if d in total_by_date:
            total_by_date[d] += 1
            if review.override:
                override_by_date[d] += 1
                
    override_data = []
    # Reverse to get chronological (oldest to newest)
    for i in range(6, -1, -1):
        d = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
        total = total_by_date[d]
        ovr = override_by_date[d]
        rate = round((ovr / total * 100), 1) if total > 0 else 0.0
        override_data.append({
            "time": d[-5:], # 'MM-DD'
            "rate": rate,
            "total_reviews": total
        })
        
    # 3. Adverse impact placeholders (since no demographic data exists, we measure model bias alerts)
    bias_alerts = db.query(AuditLog).filter(AuditLog.event_type == "BIAS_ALERT").count()

    return {
        "recommendation_distribution": rec_dist,
        "override_trends": override_data,
        "alerts": {
            "bias_alerts": bias_alerts
        }
    }
