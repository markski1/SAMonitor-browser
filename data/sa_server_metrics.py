import requests


class SAServerMetrics:
    def __init__(self, ip_addr: str, hours: int, include_misses: bool):
        metrics_request = requests.get(
            f"http://127.0.0.1:42069/api/GetServerMetrics?hours={hours}"
            f"&include_misses={1 if include_misses else 0}&ip_addr={ip_addr}"
        )

        if metrics_request.status_code != 204:
            raise Exception("Server does not exist in SAMonitor.")

        try:
            metrics = metrics_request.json()
        except:
            raise Exception("SAMonitor did not provide a valid JSON response.")

        self.logged_data = metrics

        self.total_reqs = len(metrics)
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
