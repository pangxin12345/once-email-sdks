from .client import MessagePage, OnceEmailClient
from .errors import OnceEmailError
from .generated_contract import Attachment, Inbox, Message, MessageSummary

__all__ = [
    "Attachment", "Inbox", "Message", "MessagePage", "MessageSummary",
    "OnceEmailClient", "OnceEmailError",
]

__version__ = "0.1.0.dev1"
