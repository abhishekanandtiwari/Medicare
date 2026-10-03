from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def record_audit(
    db: Session,
    action: str,
    resource: str,
    user_id: Optional[int] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """Safely records an audit log entry for security and compliance."""
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        details=details,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
