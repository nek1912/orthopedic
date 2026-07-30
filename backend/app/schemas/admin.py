from pydantic import BaseModel


class AdminLoginRequest(BaseModel):
    password: str
    remember_me: bool = False


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class AdminLoginResponse(BaseModel):
    message: str = "Login successful"
