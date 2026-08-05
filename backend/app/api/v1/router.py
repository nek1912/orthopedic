from fastapi import APIRouter

from app.api.v1.admin_auth import router as admin_auth_router
from app.api.v1.admin_activity import router as admin_activity_router
from app.api.v1.admin_notifications import router as admin_notifications_router
from app.api.v1.admin_prescriptions import router as admin_prescriptions_router
from app.api.v1.auth import router as auth_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.availability import router as availability_router
from app.api.v1.services_api import router as services_router
from app.api.v1.admin_appointments import router as admin_appointments_router
from app.api.v1.admin_patients import router as admin_patients_router
from app.api.v1.admin_search import router as admin_search_router
from app.api.v1.admin_unavailability import router as admin_unavailability_router
from app.api.v1.admin_settings import router as admin_settings_router
from app.api.v1.admin_stats import router as admin_stats_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(admin_auth_router)
router.include_router(admin_activity_router)
router.include_router(admin_notifications_router)
router.include_router(admin_prescriptions_router)
router.include_router(appointments_router)
router.include_router(availability_router)
router.include_router(services_router)
router.include_router(admin_appointments_router)
router.include_router(admin_patients_router)
router.include_router(admin_search_router)
router.include_router(admin_unavailability_router)
router.include_router(admin_settings_router)
router.include_router(admin_stats_router)
