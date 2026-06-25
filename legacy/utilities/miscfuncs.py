import datetime
from functools import wraps

from flask import render_template, request


def htmx_check(func):
    """
    Checks if the request was made by HTMX. Used to decide if a full page should be returned, or just a component.
    :param func: Function passed by decorator.
    :return: A boolean `is_htmx` indicating if the request was sent by an HTMX call.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'HX-Request' in request.headers:
            is_htmx = True
        else:
            is_htmx = False

        return func(is_htmx, *args, **kwargs)

    return wrapper


def render_server(server, details=False):
    return render_template("components/server-snippet.html",
                           server=server, detailed=details)


def parse_datetime(datetime_str):
    if '.' in datetime_str and datetime_str.endswith('Z'):
        # Truncate the microseconds to 6 digits
        datetime_str = datetime_str[:-8] + datetime_str[-8:-2] + 'Z'
        return (datetime.datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%S.%fZ")).replace(tzinfo=datetime.timezone.utc)
    else:
        datetime_str = datetime_str.replace('Z', '')
        try:
            return (datetime.datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%S")).replace(tzinfo=datetime.timezone.utc)
        except ValueError:
            return datetime.datetime.now()
