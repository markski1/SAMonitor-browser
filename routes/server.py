from flask import Blueprint, render_template

from utilities.miscfuncs import htmx_check
from utilities.server import get_server_data, get_server_metrics

server_bp = Blueprint("server", __name__, url_prefix="/")


@server_bp.route("/server/<string:server_ip>")
@htmx_check
def server_page(is_htmx, server_ip):
    try:
        server = get_server_data(ip_addr=server_ip)
        metrics = get_server_metrics(ip_addr=server_ip, hours=168, include_misses=True)
    except:
        return "<p>Error contacting API. Server may not exist.</p>"

    return render_template("server.html", htmx=is_htmx,
                           server=server, metrics=metrics)
