import datetime
from functools import wraps

from flask import render_template, request


def htmx_check(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'HX-Request' in request.headers:
            is_htmx = True
        else:
            is_htmx = False

        return func(is_htmx, *args, **kwargs)

    return wrapper


def render_server(server, details=False):
    server_data = parse_server_data(server)

    return render_template("components/server-snippet.html",
                           server=server, name=server_data['name'], website=server_data['website'],
                           lag_comp=server_data['lag_comp'], last_updated=server_data['last_updated'], detailed=details)


def parse_server_data(server):
    if server["website"] != "Unknown":
        if 'http' not in server["website"] and '://' not in server["website"]:
            server["website"] = f"https://{server['website']}"
        website = f"<a href='{server['website']}'>{server['website']}</a>"
    else:
        website = "No website specified."

    match server["lagComp"]:
        case 1:
            lag_comp = "Enabled"
        case _:
            lag_comp = "Disabled"

    last_updated = parse_datetime(server['lastUpdated'])
    current_utc = datetime.datetime.now(datetime.timezone.utc)
    last_updated_delta = current_utc - last_updated
    last_updated_sec = last_updated_delta.total_seconds()

    hours = int(last_updated_sec // 3600)
    minutes = int((last_updated_sec % 3600) // 60)

    if hours > 0:
        if hours == 1:
            last_updated_str = f"{hours} hour ago"
        else:
            last_updated_str = f"{hours} hours ago"
    else:
        if minutes == 1:
            last_updated_str = f"{minutes} minute ago"
        else:
            last_updated_str = f"{minutes} minutes ago"

    server_name = server["name"].strip()

    if server['isOpenMp'] == 1:
        software = "open.mp"
    else:
        software = "SA-MP"

    return {
        "name": server_name,
        "website": website,
        "last_updated": last_updated_str,
        "lag_comp": lag_comp,
        "software": software
    }


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
