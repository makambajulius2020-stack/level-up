"""
Avoid importing submodules here to prevent circular imports when
referencing e.g. `app.routes.auth`. Submodules are imported explicitly
inside `app/__init__.py` when creating the Flask app.

Keep this file minimal.
"""

__all__ = []
