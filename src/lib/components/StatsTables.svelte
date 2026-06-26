<script lang="ts">
    import type { GamemodeStats, LanguageStats } from "$lib/types/stats";
    import { formatThousands } from "$lib/format/number";

    interface Props {
        languageStats: LanguageStats;
        gamemodeStats: GamemodeStats;
    }

    let { languageStats, gamemodeStats }: Props = $props();

    type Row = { name: string; servers: number; players: number };

    const languageLabels: Record<keyof LanguageStats, string> = {
        russian: "Russian",
        english: "English",
        spanish: "Spanish",
        portuguese: "Portuguese",
        romanian: "Romanian",
        eastEuro: "Misc. East Europe",
        westEuro: "Misc. West Europe",
        asia: "Misc. Asia",
        other: "Other",
    };

    const gamemodeLabels: Record<keyof GamemodeStats, string> = {
        roleplay: "Roleplay",
        deathmatch: "Deathmatch",
        raceStunt: "Race/Stunt/Drift",
        cnr: "Cops and Robbers",
        freeRoam: "Freeroam",
        survival: "Survival",
        vehSim: "Vehicle Simulation",
        other: "Other",
    };

    const languageRows = $derived(
        (
            Object.entries(languageStats) as [
                keyof LanguageStats,
                { amount: number; players: number },
            ][]
        )
            .filter(([key]) => key !== "other")
            .map<Row>(([key, v]) => ({
                name: languageLabels[key],
                servers: v.amount,
                players: v.players,
            }))
            .sort((a, b) => b.servers - a.servers),
    );

    const otherLanguageAmount = $derived(languageStats.other.amount);

    const gamemodeRows = $derived(
        (
            Object.entries(gamemodeStats) as [
                keyof GamemodeStats,
                { amount: number; players: number },
            ][]
        )
            .filter(([key]) => key !== "other")
            .map<Row>(([key, v]) => ({
                name: gamemodeLabels[key],
                servers: v.amount,
                players: v.players,
            }))
            .sort((a, b) => b.servers - a.servers),
    );

    const otherGamemodeAmount = $derived(gamemodeStats.other.amount);
</script>

<div class="innerContent">
    <h3>Miscellaneous stats</h3>
    <p>Amount of servers by language</p>
    <table class="compactTable statsTable" id="language_table">
        <thead>
            <tr>
                <th>Language</th>
                <th class="num-col">Servers</th>
                <th class="num-col">Players</th>
            </tr>
        </thead>
        <tbody>
            {#each languageRows as row (row.name)}
                <tr>
                    <td>{row.name}</td>
                    <td class="num-col">{row.servers}</td>
                    <td class="num-col">{formatThousands(row.players)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
    <p>
        <small
            >The other {otherLanguageAmount} servers don't have a defined language.</small
        >
    </p>

    <p>Amount of servers by gamemode</p>
    <table class="compactTable statsTable" id="gamemode_table">
        <thead>
            <tr>
                <th>Gamemode</th>
                <th class="num-col">Servers</th>
                <th class="num-col">Players</th>
            </tr>
        </thead>
        <tbody>
            {#each gamemodeRows as row (row.name)}
                <tr>
                    <td>{row.name}</td>
                    <td class="num-col">{row.servers}</td>
                    <td class="num-col">{formatThousands(row.players)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
    <p>
        <small
            >The other {otherGamemodeAmount} servers don't have a defined gamemode.</small
        >
    </p>

    <p style="margin-top: 1rem">
        There seems to be a practice to use the 'Language' or 'Gamemode' fields
        for the name of the server rather than what they actually are. Server
        owners, please, this makes it harder for people to find your server.
    </p>
</div>
