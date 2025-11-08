# Services package for Smart School System

from .n8n_service import get_n8n_service, n8n_service
from .workflow_triggers import get_workflow_trigger_service, workflow_trigger_service

__all__ = [
    'get_n8n_service',
    'n8n_service', 
    'get_workflow_trigger_service',
    'workflow_trigger_service'
]
