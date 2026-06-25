import datetime

import requests

from utilities.miscfuncs import parse_datetime


class SAServer:
    def __init__(self, ip_addr=None, server_json=None):
        if ip_addr is not None:
            server_request = requests.get(f"http://127.0.0.1:42069/api/GetServerByIP?ip_addr={ip_addr}")
            if server_request.status_code != 204:
                raise Exception("Server does not exist in SAMonitor.")
            server_data = server_request.json()
        elif server_json is not None:
            server_data = server_json
        else:
            raise Exception("No IP or data provided.")

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

        self.last_updated = parse_datetime(server_data['lastUpdated'])

    def formatted_last_updated(self):
        current_utc = datetime.datetime.now(datetime.timezone.utc)
        last_updated_delta = current_utc - self.last_updated
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
