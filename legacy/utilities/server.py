from data.sa_server import SAServer
from data.sa_server_metrics import SAServerMetrics


def get_server_metrics(ip_addr: str, hours: int, include_misses: bool) -> SAServerMetrics | None:
    try:
        return SAServerMetrics(ip_addr, hours, include_misses)
    except:
        return None


def get_server_data(ip_addr: str | None = None, server_json: str | None = None) -> SAServer | None:
    try:
        if ip_addr:
            return SAServer(ip_addr)
        elif server_json:
            return SAServer(server_json)
        else:
            print("No IP address or data provided for a get_server_data call.")
            raise Exception("No IP or data provided.")
    except:
        return None
