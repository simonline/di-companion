from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import secrets
import os
from app.core.supabase import get_supabase_client
from app.services.email import email_service
from pydantic import BaseModel, EmailStr

router = APIRouter()

async def get_current_user_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    return authorization.replace("Bearer ", "")

class InvitationCreate(BaseModel):
    email: EmailStr
    startup_id: str
    inviter_name: str
    startup_name: str

class InvitationResend(BaseModel):
    invitation_id: str

@router.post("/invitations/send")
async def send_invitation(
    invitation: InvitationCreate,
    access_token: str = Depends(get_current_user_token)
) -> Dict[str, Any]:
    try:
        supabase = get_supabase_client(access_token)
        
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(days=7)
        
        auth_response = supabase.auth.get_user(access_token)
        if not auth_response or not auth_response.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_id = auth_response.user.id
        
        existing = supabase.table('invitations').select("*").eq('email', invitation.email).eq('startup_id', invitation.startup_id).eq('invitation_status', 'pending').execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="An active invitation already exists for this email")
        
        invitation_data = {
            "email": invitation.email,
            "startup_id": invitation.startup_id,
            "invited_by_id": user_id,
            "token": token,
            "invitation_status": "pending",
            "expires_at": expires_at.isoformat()
        }
        
        result = supabase.table('invitations').insert(invitation_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create invitation")
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        invitation_link = f"{frontend_url}/accept-invitation?token={token}"
        expiration_date = expires_at.strftime("%B %d, %Y")
        
        email_sent = await email_service.send_invitation(
            email=invitation.email,
            inviter_name=invitation.inviter_name,
            startup_name=invitation.startup_name,
            invitation_link=invitation_link,
            expiration_date=expiration_date
        )
        
        if not email_sent:
            print(f"Warning: Failed to send invitation email to {invitation.email}")
        
        return {
            "success": True,
            "invitation": result.data[0],
            "email_sent": email_sent
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending invitation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invitations/resend")
async def resend_invitation(
    resend: InvitationResend,
    access_token: str = Depends(get_current_user_token)
) -> Dict[str, Any]:
    try:
        supabase = get_supabase_client(access_token)
        
        auth_response = supabase.auth.get_user(access_token)
        if not auth_response or not auth_response.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        invitation_result = supabase.table('invitations').select("*, invited_by:profiles!invitations_invited_by_id_fkey(given_name, family_name), startup:startups(name)").eq('id', resend.invitation_id).single().execute()
        
        if not invitation_result.data:
            raise HTTPException(status_code=404, detail="Invitation not found")
        
        invitation = invitation_result.data
        
        if invitation['invitation_status'] != 'pending':
            raise HTTPException(status_code=400, detail="Can only resend pending invitations")
        
        new_expires_at = datetime.now() + timedelta(days=7)
        
        update_result = supabase.table('invitations').update({
            "expires_at": new_expires_at.isoformat()
        }).eq('id', resend.invitation_id).execute()
        
        if not update_result.data:
            raise HTTPException(status_code=500, detail="Failed to update invitation")
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        invitation_link = f"{frontend_url}/accept-invitation?token={invitation['token']}"
        expiration_date = new_expires_at.strftime("%B %d, %Y")
        
        inviter_name = f"{invitation['invited_by']['given_name']} {invitation['invited_by']['family_name']}" if invitation.get('invited_by') else "A team member"
        startup_name = invitation['startup']['name'] if invitation.get('startup') else "the startup"
        
        email_sent = await email_service.send_invitation_reminder(
            email=invitation['email'],
            inviter_name=inviter_name,
            startup_name=startup_name,
            invitation_link=invitation_link,
            expiration_date=expiration_date
        )
        
        if not email_sent:
            print(f"Warning: Failed to send reminder email to {invitation['email']}")
        
        return {
            "success": True,
            "invitation": update_result.data[0],
            "email_sent": email_sent
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error resending invitation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invitations/accept/{token}")
async def accept_invitation(
    token: str,
    access_token: str = Depends(get_current_user_token)
) -> Dict[str, Any]:
    try:
        supabase = get_supabase_client(access_token)
        
        auth_response = supabase.auth.get_user(access_token)
        if not auth_response or not auth_response.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        user_id = auth_response.user.id
        
        invitation_result = supabase.table('invitations').select("*, startup:startups(*)").eq('token', token).single().execute()
        
        if not invitation_result.data:
            raise HTTPException(status_code=404, detail="Invalid invitation token")
        
        invitation = invitation_result.data
        
        if invitation['invitation_status'] != 'pending':
            raise HTTPException(status_code=400, detail="Invitation has already been used")
        
        expires_at = datetime.fromisoformat(invitation['expires_at'].replace('Z', '+00:00'))
        if expires_at < datetime.now(expires_at.tzinfo):
            raise HTTPException(status_code=400, detail="Invitation has expired")
        
        supabase.table('invitations').update({
            "invitation_status": "accepted"
        }).eq('id', invitation['id']).execute()
        
        existing_member = supabase.table('startups_users_lnk').select("*").eq('startup_id', invitation['startup_id']).eq('user_id', user_id).execute()
        
        if not existing_member.data:
            supabase.table('startups_users_lnk').insert({
                "startup_id": invitation['startup_id'],
                "user_id": user_id
            }).execute()
        
        return {
            "success": True,
            "startup": invitation['startup'],
            "message": "Invitation accepted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error accepting invitation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))