import qrcode
import io
import base64
import json
from typing import Dict, Any

def generate_appointment_qr_base64(appointment_data: Dict[str, Any]) -> str:
    """
    Generates a secure QR code encoding appointment verification payload
    and returns a data URL (image/png;base64,...).
    """
    payload_str = json.dumps(appointment_data, separators=(',', ':'))
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3,
    )
    qr.add_data(payload_str)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
