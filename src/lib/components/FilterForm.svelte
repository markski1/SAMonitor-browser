<script lang="ts">
    import { filters, type ServerFilters } from '$lib/stores/filters';

    let local = $state<ServerFilters>({ ...$filters });

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function commit() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filters.set({ ...local });
        }, 500);
    }

    // Whenever the store changes from outside (e.g. reset), sync the form.
    $effect(() => {
        const f = $filters;
        if (
            f.name !== local.name ||
            f.gamemode !== local.gamemode ||
            f.language !== local.language ||
            f.showEmpty !== local.showEmpty ||
            f.hideRoleplay !== local.hideRoleplay ||
            f.requireSampcac !== local.requireSampcac ||
            f.order !== local.order
        ) {
            local = { ...f };
        }
    });
</script>

<form
    class="filterBox"
    onsubmit={(e) => {
        e.preventDefault();
        commit();
    }}
>
    <h2>Filter options</h2>
    <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 1rem; margin-top: .6rem;">
        <fieldset style="flex: 1 1;" class="flexBox">
            <table style="margin-top: .66rem;">
                <tbody>
                    <tr>
                        <td><label for="name">Name:</label></td>
                        <td>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                bind:value={local.name}
                                onkeyup={commit}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label for="gamemode">Gamemode:</label></td>
                        <td>
                            <input
                                type="text"
                                id="gamemode"
                                name="gamemode"
                                bind:value={local.gamemode}
                                onkeyup={commit}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label for="language">Language:</label></td>
                        <td>
                            <input
                                type="text"
                                id="language"
                                name="language"
                                bind:value={local.language}
                                onkeyup={commit}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </fieldset>
        <fieldset style="flex: 1 1;" class="flexBox">
            <label
                ><input type="checkbox" name="show_empty" bind:checked={local.showEmpty} onchange={commit} /> Show
                empty servers</label
            ><br />
            <label
                ><input
                    type="checkbox"
                    name="hide_roleplay"
                    bind:checked={local.hideRoleplay}
                    onchange={commit}
                /> No roleplay servers</label
            ><br />
            <label
                ><input
                    type="checkbox"
                    name="require_sampcac"
                    bind:checked={local.requireSampcac}
                    onchange={commit}
                /> SAMPCAC Required</label
            ><br />
            <table style="width: 100%; margin-top: .75rem">
                <tbody>
                    <tr>
                        <td>
                            <label for="order">Order by:</label>
                        </td>
                        <td style="text-align: right">
                            <select
                                style="width: 100%"
                                name="order"
                                id="order"
                                bind:value={local.order}
                                onchange={commit}
                            >
                                <option value="none" selected>Don't order</option>
                                <option value="players">Player count</option>
                                <option value="ratio">Players/max ratio</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        </fieldset>
    </div>
</form>
