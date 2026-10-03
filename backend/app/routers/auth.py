from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.patient import PatientProfile
from app.models.doctor import DoctorProfile, DoctorAvailability
from app.models.gamification import Gamification

from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    PasswordResetRequest,
)

from app.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.auth.dependencies import get_current_user
from app.utils.audit import record_audit
from app.dsa import app_cache


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# REGISTER
# ============================================================

@router.post("/register", response_model=Token)
def register(
    req: UserRegister,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new patient or doctor account.

    Patient registration creates:
        1. User
        2. PatientProfile
        3. Gamification

    Doctor registration creates:
        1. User
        2. DoctorProfile
        3. Default weekly availability
    """

    # --------------------------------------------------------
    # 1. Check whether email already exists
    # --------------------------------------------------------

    email = req.email.lower().strip()

    existing = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # --------------------------------------------------------
    # 2. Validate role
    # --------------------------------------------------------

    clean_role = req.role.lower().strip()

    if clean_role not in ["patient", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'patient' or 'doctor'."
        )

    try:

        # ====================================================
        # 3. Create User
        # ====================================================

        new_user = User(
            email=email,
            password_hash=hash_password(req.password),
            role=clean_role,
            is_active=True
        )

        db.add(new_user)

        # Flush without committing.
        # This generates new_user.id.
        db.flush()

        # ====================================================
        # 4. PATIENT REGISTRATION
        # ====================================================

        if clean_role == "patient":

            # ------------------------------------------------
            # Create Patient Profile
            # ------------------------------------------------

            patient_profile = PatientProfile(
                user_id=new_user.id,
                name=req.name,
                dob=req.dob,
                age=req.age,
                gender=req.gender,
                blood_group=req.blood_group,
                allergies=req.allergies,
                existing_conditions=req.existing_conditions,
                emergency_contact_name=req.emergency_contact_name,
                emergency_contact_phone=req.emergency_contact_phone,
                preferred_language="en",
                accessibility_mode="standard"
            )

            db.add(patient_profile)

            # IMPORTANT:
            # Generate patient_profile.id before creating
            # the Gamification record.
            db.flush()

            # ------------------------------------------------
            # Create Gamification Profile
            # ------------------------------------------------

            game = Gamification(
                patient_id=patient_profile.id,
                points=100,
                current_streak=1,
                highest_streak=1,
                badges='["Health Pioneer", "Profile Initialized"]'
            )

            db.add(game)

        # ====================================================
        # 5. DOCTOR REGISTRATION
        # ====================================================

        elif clean_role == "doctor":

            # ------------------------------------------------
            # Create Doctor Profile
            # ------------------------------------------------

            doctor_profile = DoctorProfile(
                user_id=new_user.id,
                name=req.name,
                specialization=req.specialization or "General Medicine",
                qualification=req.qualification or "MBBS, MD",
                experience_years=req.experience_years or 5,
                is_verified=False,
                hospital_name="Medicare Health Center",
                location="Main Medical Hub"
            )

            db.add(doctor_profile)

            # Generate doctor_profile.id
            db.flush()

            # ------------------------------------------------
            # Create Default Doctor Availability
            # ------------------------------------------------

            days = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
            ]

            for day in days:

                availability = DoctorAvailability(
                    doctor_id=doctor_profile.id,
                    day_of_week=day,
                    start_time="09:00",
                    end_time="17:00",
                    slot_duration_minutes=30,
                    is_available=True
                )

                db.add(availability)

        # ====================================================
        # 6. Commit Complete Registration
        # ====================================================

        db.commit()

        # Refresh user from database
        db.refresh(new_user)

    except Exception as e:

        # ----------------------------------------------------
        # Rollback everything if registration fails
        # ----------------------------------------------------

        db.rollback()

        print(
            f"[REGISTER ERROR] "
            f"{type(e).__name__}: {str(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create account. Please try again."
        )

    # ========================================================
    # 7. Audit Log
    # ========================================================

    record_audit(
        db,
        action="REGISTER",
        resource="USERS",
        user_id=new_user.id,
        details=f"Registered role {clean_role}",
        ip_address=(
            request.client.host
            if request.client
            else None
        )
    )

    # ========================================================
    # 8. Create JWT Token
    # ========================================================

    token = create_access_token(
        {
            "sub": str(new_user.id),
            "role": new_user.role,
            "email": new_user.email
        }
    )

    # ========================================================
    # 9. Cache User Session
    # ========================================================

    app_cache.put(
        f"session:{new_user.id}",
        {
            "role": new_user.role,
            "email": new_user.email,
            "name": req.name
        }
    )

    # ========================================================
    # 10. Return Response
    # ========================================================

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": new_user.role,
        "user_id": new_user.id,
        "name": req.name,
        "email": new_user.email
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login", response_model=Token)
def login(
    req: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Login an existing patient, doctor, or admin.
    """

    email = req.email.lower().strip()

    # --------------------------------------------------------
    # Find User
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # --------------------------------------------------------
    # Validate credentials
    # --------------------------------------------------------

    if not user or not verify_password(
        req.password,
        user.password_hash
    ):

        record_audit(
            db,
            action="FAILED_LOGIN",
            resource="USERS",
            details=f"Failed login attempt for {req.email}",
            ip_address=(
                request.client.host
                if request.client
                else None
            )
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination."
        )

    # --------------------------------------------------------
    # Check account status
    # --------------------------------------------------------

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated."
        )

    # ========================================================
    # Determine Display Name
    # ========================================================

    name = user.email.split("@")[0].title()

    if user.role == "patient" and user.patient_profile:

        name = user.patient_profile.name

    elif user.role == "doctor" and user.doctor_profile:

        name = user.doctor_profile.name

    elif user.role == "admin":

        name = "System Administrator"

    # ========================================================
    # Create JWT
    # ========================================================

    token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
            "email": user.email
        }
    )

    # ========================================================
    # Audit Login
    # ========================================================

    record_audit(
        db,
        action="LOGIN",
        resource="USERS",
        user_id=user.id,
        details="User logged in",
        ip_address=(
            request.client.host
            if request.client
            else None
        )
    )

    # ========================================================
    # Store Session in HashMap DSA Cache
    # ========================================================

    app_cache.put(
        f"session:{user.id}",
        {
            "role": user.role,
            "email": user.email,
            "name": name
        }
    )

    # ========================================================
    # Return Login Response
    # ========================================================

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "name": name,
        "email": user.email
    }
    
    
# ============================================================
# OAUTH2 TOKEN LOGIN FOR SWAGGER
# ============================================================

@router.post("/token", include_in_schema=False)
def oauth2_login(
    username: str = Form(...),
    password: str = Form(...),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    OAuth2-compatible login endpoint used by Swagger UI.
    The normal /login endpoint remains unchanged.
    """

    email = username.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user or not verify_password(
        password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated."
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
            "email": user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }



# ============================================================
# CURRENT USER
# ============================================================

@router.get("/me")
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return information about the currently authenticated user.
    """

    # Default name
    name = current_user.email.split("@")[0].title()

    profile_data = {}

    # ========================================================
    # Patient
    # ========================================================

    if (
        current_user.role == "patient"
        and current_user.patient_profile
    ):

        name = current_user.patient_profile.name

        profile_data = {
            "age": current_user.patient_profile.age,
            "gender": current_user.patient_profile.gender,
            "blood_group": current_user.patient_profile.blood_group,
            "accessibility_mode": (
                current_user.patient_profile.accessibility_mode
            ),
            "preferred_language": (
                current_user.patient_profile.preferred_language
            )
        }

    # ========================================================
    # Doctor
    # ========================================================

    elif (
        current_user.role == "doctor"
        and current_user.doctor_profile
    ):

        name = current_user.doctor_profile.name

        profile_data = {
            "specialization": (
                current_user.doctor_profile.specialization
            ),
            "is_verified": (
                current_user.doctor_profile.is_verified
            ),
            "experience_years": (
                current_user.doctor_profile.experience_years
            )
        }

    # ========================================================
    # Admin
    # ========================================================

    elif current_user.role == "admin":

        name = "System Administrator"

    # ========================================================
    # Response
    # ========================================================

    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "name": name,
        "profile": profile_data
    }


# ============================================================
# LOGOUT
# ============================================================

@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout the current user and remove their cached session.
    """

    # Remove session from HashMap cache
    app_cache.remove(
        f"session:{current_user.id}"
    )

    # Audit log
    record_audit(
        db,
        action="LOGOUT",
        resource="USERS",
        user_id=current_user.id,
        details="User logged out"
    )

    return {
        "message": "Successfully logged out."
    }


# ============================================================
# RESET PASSWORD
# ============================================================

@router.post("/reset-password")
def reset_password(
    req: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Reset the password for an existing account.
    """

    email = req.email.lower().strip()

    # --------------------------------------------------------
    # Find user
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account registered with this email address."
        )

    try:

        # ----------------------------------------------------
        # Update password
        # ----------------------------------------------------

        user.password_hash = hash_password(
            req.new_password
        )

        db.commit()

        # ----------------------------------------------------
        # Audit
        # ----------------------------------------------------

        record_audit(
            db,
            action="PASSWORD_RESET",
            resource="USERS",
            user_id=user.id,
            details="Password changed"
        )

    except Exception as e:

        db.rollback()

        print(
            f"[PASSWORD RESET ERROR] "
            f"{type(e).__name__}: {str(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset password. Please try again."
        )

    return {
        "message": (
            "Password updated successfully. "
            "You can now login with your new credentials."
        )
    }