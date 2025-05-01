import datetime
import requests

from utilities.miscfuncs import parse_datetime


class SAServer:
    def __init__(self, ip_addr):
        server_request = requests.get(f"http://127.0.0.1:42069/api/GetServerByIP?ip_addr={ip_addr}")

        if server_request.status_code != 204:
            raise Exception("Server does not exist in SAMonitor.")

        try:
            server_data = server_request.json()
        except:
            raise Exception("SAMonitor did not provide a valid JSON response.")

        self.id = server_data["id"]
        self.name = server_data["name"].strip()
        self.players_online = server_data["playersOnline"]
        self.max_players = server_data["maxPlayers"]
        self.gamemode = server_data["gameMode"]
        self.language = server_data["language"]
        self.mapname = server_data["mapName"]
        self.version = server_data["version"]
        self.sampcac = server_data["sampCac"]

        self.ip_addr = ip_addr
        if 'http' not in server_data["website"] and '://' not in server_data["website"]:
            server_data["website"] = f"https://{server_data['website']}"
        self.website = server_data["website"]
        match server_data["lagComp"]:
            case 1:
                self.lagcomp = "Enabled"
            case _:
                self.lagcomp = "Disabled"

        if server_data["isOpenMp"] == 1:
            self.software = "open.mp"
        else:
            self.software = "SA-MP"

        last_updated = parse_datetime(server_data['lastUpdated'])
        current_utc = datetime.datetime.now(datetime.timezone.utc)
        last_updated_delta = current_utc - last_updated
        last_updated_sec = last_updated_delta.total_seconds()

        hours = int(last_updated_sec // 3600)
        minutes = int((last_updated_sec % 3600) // 60)

        if hours > 0:
            if hours == 1:
                self.last_updated = f"{hours} hour ago"
            else:
                self.last_updated = f"{hours} hours ago"
        else:
            if minutes == 1:
                self.last_updated = f"{minutes} minute ago"
            else:
                self.last_updated = f"{minutes} minutes ago"

    def website_anchor(self):
        return f"<a href='{self.website}'>{self.website}</a>"


class SAServerMetrics:
    def __init__(self, ip_addr):
        metrics_request = requests.get(
            f"http://127.0.0.1:42069/api/GetServerMetrics?hours=168&include_misses=1&ip_addr={ip_addr}"
        )

        if metrics_request.status_code != 204:
            raise Exception("Server does not exist in SAMonitor.")

        try:
            metrics = metrics_request.json()
        except:
            raise Exception("SAMonitor did not provide a valid JSON response.")

        self.self.total_reqs = len(metrics)
        self.missed_reqs = 0
        self.total_players_m = 0

        for instant in metrics:
            if instant["players"] < 0:
                self.missed_reqs += 1
            else:
                self.total_players_m += instant["players"]

        self.uptime_pct = 100.0
        self.avg_players = 0.0

        if self.total_reqs > 0:
            if self.missed_reqs > 0:
                downtime_pct = (self.missed_reqs / self.total_reqs) * 100
                self.uptime_pct = 100 - downtime_pct

            req_success = self.total_reqs - self.missed_reqs
            if req_success > 0:
                self.avg_players = self.total_players_m / req_success


def get_server_metrics(ip_addr: str) -> SAServerMetrics | None:
    try:
        return SAServerMetrics(ip_addr)
    except:
        return None


def get_server_data(ip_addr: str) -> SAServer | None:
    try:
        return SAServer(ip_addr)
    except:
        return None
