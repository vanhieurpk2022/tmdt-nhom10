from contextvars import ContextVar


progress_callback = ContextVar("chat_progress", default=None)


def report_progress(phase):
    callback = progress_callback.get()
    if callback is not None:
        callback({"type": "status", "phase": phase})
