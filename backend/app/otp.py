import os
import random
import smtplib

from datetime import datetime, timedelta

from email.message import EmailMessage


# =========================================================
# OTP STORAGE
# =========================================================

otp_storage = {}


# =========================================================
# OTP CONFIGURATION
# =========================================================

OTP_EXPIRY_MINUTES = 5


# =========================================================
# GENERATE OTP
# =========================================================

def generate_otp():

    return str(
        random.randint(
            100000,
            999999
        )
    )


# =========================================================
# SAVE OTP
# =========================================================

def save_otp(
    email: str,
    otp: str
):

    email = email.strip().lower()

    otp_storage[email] = {

        "otp": otp,

        "expires_at":
            datetime.now()
            +
            timedelta(
                minutes=OTP_EXPIRY_MINUTES
            )
    }


# =========================================================
# VERIFY OTP
# =========================================================

def verify_otp(
    email: str,
    entered_otp: str
):

    email = email.strip().lower()

    entered_otp = entered_otp.strip()


    stored = otp_storage.get(email)


    if not stored:

        return (
            False,
            "OTP not found or already used."
        )


    # -----------------------------------------------------
    # CHECK EXPIRATION
    # -----------------------------------------------------

    if datetime.now() > stored["expires_at"]:

        del otp_storage[email]

        return (
            False,
            "OTP has expired. Please request a new OTP."
        )


    # -----------------------------------------------------
    # CHECK OTP
    # -----------------------------------------------------

    if stored["otp"] != entered_otp:

        return (
            False,
            "Incorrect OTP. Please try again."
        )


    # -----------------------------------------------------
    # OTP SUCCESS
    # -----------------------------------------------------

    del otp_storage[email]

    return (
        True,
        "OTP verified successfully."
    )


# =========================================================
# SEND OTP THROUGH GMAIL
# =========================================================

def send_otp_email(
    recipient_email: str,
    otp: str
):

    sender_email = os.getenv(
        "GMAIL_SENDER_EMAIL"
    )

    sender_password = os.getenv(
        "GMAIL_APP_PASSWORD"
    )


    # -----------------------------------------------------
    # CHECK CONFIGURATION
    # -----------------------------------------------------

    if not sender_email:

        return (
            False,
            "GMAIL_SENDER_EMAIL is not configured."
        )


    if not sender_password:

        return (
            False,
            "GMAIL_APP_PASSWORD is not configured."
        )


    # -----------------------------------------------------
    # CREATE EMAIL
    # -----------------------------------------------------

    message = EmailMessage()

    message["Subject"] = (
        "Waypoint Login Verification Code"
    )

    message["From"] = sender_email

    message["To"] = recipient_email

    message.set_content(
        f"""
Hello,

Your Waypoint verification code is:

{otp}

This OTP is valid for {OTP_EXPIRY_MINUTES} minutes.

If you did not request this verification code,
please ignore this email.

Regards,
Waypoint Maritime Brokerage Platform
"""
    )


    try:

        # Gmail SMTP with SSL
        with smtplib.SMTP_SSL(
            "smtp.gmail.com",
            465
        ) as server:

            server.login(
                sender_email,
                sender_password
            )

            server.send_message(
                message
            )


        return (
            True,
            "OTP email sent successfully."
        )


    except Exception as error:

        print(
            "Gmail OTP error:",
            error
        )

        return (
            False,
            str(error)
        )