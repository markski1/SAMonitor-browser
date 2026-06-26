<script lang="ts">
    import { filters, DEFAULT_FILTERS, type ServerFilters } from '$lib/stores/filters';

    let local: ServerFilters = $state({ ...DEFAULT_FILTERS });

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let lastSyncedStore: string | null = null;

    function commit() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filters.set({ ...local });
        }, 500);
    }

    // Sync the form from the store whenever the store changes externally

    $effect(() => {
        const f = $filters;
        const serialized = JSON.stringify(f);
        if (serialized === lastSyncedStore) return;
        lastSyncedStore = serialized;
        local = { ...f };
    });
</script>

<form
    class="filterBox"
    onsubmit={(e) => {
        e.preventDefault();
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        filters.set({ ...local });
    }}
>
    <div class="filter-header">
        <h2>Filters</h2>
    </div>

    <div class="filter-fields">
        <label class="filter-field" for="name">
            <span>Name</span>
            <input
                type="text"
                id="name"
                name="name"
                bind:value={local.name}
                onkeyup={commit}
                placeholder="Server name"
            />
        </label>

        <label class="filter-field" for="gamemode">
            <span>Gamemode</span>
            <input
                type="text"
                id="gamemode"
                name="gamemode"
                bind:value={local.gamemode}
                onkeyup={commit}
                placeholder="Roleplay, DM, Freeroam..."
            />
        </label>

        <label class="filter-field" for="language">
            <span>Language</span>
            <input
                type="text"
                id="language"
                name="language"
                bind:value={local.language}
                onkeyup={commit}
                placeholder="English, Spanish..."
            />
        </label>

        <label class="filter-field" for="order">
            <span>Order by</span>
            <select name="order" id="order" bind:value={local.order} onchange={commit}>
                <option value="none" selected>Default</option>
                <option value="players">Player count</option>
                <option value="ratio">Players / max ratio</option>
            </select>
        </label>
    </div>

    <div class="filter-toggles">
        <label class="toggle-chip"
            ><input
                type="checkbox"
                name="show_empty"
                bind:checked={local.showEmpty}
                onchange={commit}
            />
            <span>Show empty servers</span></label
        >
        <label class="toggle-chip"
            ><input
                type="checkbox"
                name="hide_roleplay"
                bind:checked={local.hideRoleplay}
                onchange={commit}
            />
            <span>No roleplay servers</span></label
        >
    </div>
</form>
