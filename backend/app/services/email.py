import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Optional
from pathlib import Path
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_pass = os.getenv("SMTP_PASS")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)
        self.from_name = os.getenv("FROM_NAME", "DI Companion")
        self.templates_dir = Path(__file__).parent.parent / "templates" / "email"
        
    def _load_template(self, template_name: str) -> str:
        template_path = self.templates_dir / f"{template_name}.html"
        if not template_path.exists():
            raise FileNotFoundError(f"Email template {template_name} not found")
        with open(template_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def _replace_variables(self, template: str, variables: Dict[str, str]) -> str:
        for key, value in variables.items():
            template = template.replace(f"{{{{{key}}}}}", str(value))
        return template
    
    async def send_email(
        self,
        to: str,
        subject: str,
        template_name: str,
        variables: Optional[Dict[str, str]] = None
    ) -> bool:
        try:
            if not self.smtp_user or not self.smtp_pass:
                logger.error("SMTP credentials not configured")
                return False
            
            template = self._load_template(template_name)
            
            if variables:
                template = self._replace_variables(template, variables)
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to
            
            html_part = MIMEText(template, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to}: {str(e)}")
            return False
    
    async def send_invitation(
        self,
        email: str,
        inviter_name: str,
        startup_name: str,
        invitation_link: str,
        expiration_date: str
    ) -> bool:
        current_year = str(datetime.now().year)
        
        variables = {
            "inviterName": inviter_name,
            "startupName": startup_name,
            "invitationLink": invitation_link,
            "expirationDate": expiration_date,
            "currentYear": current_year
        }
        
        return await self.send_email(
            to=email,
            subject=f"Invitation to join {startup_name}",
            template_name="invitation",
            variables=variables
        )
    
    async def send_invitation_reminder(
        self,
        email: str,
        inviter_name: str,
        startup_name: str,
        invitation_link: str,
        expiration_date: str
    ) -> bool:
        current_year = str(datetime.now().year)
        
        variables = {
            "inviterName": inviter_name,
            "startupName": startup_name,
            "invitationLink": invitation_link,
            "expirationDate": expiration_date,
            "currentYear": current_year
        }
        
        return await self.send_email(
            to=email,
            subject=f"Reminder: Invitation to join {startup_name}",
            template_name="invitation-reminder",
            variables=variables
        )

email_service = EmailService()