<script lang="ts">
    interface Props {
        ip: string;
        buttonId: string;
    }

    let { ip, buttonId }: Props = $props();

    let label = $state('Copy IP');

    async function copy() {
        try {
            await navigator.clipboard.writeText(ip);
            label = 'IP Copied!';
            setTimeout(() => {
                label = 'Copy IP';
            }, 3000);
        } catch {
            label = 'Copy failed';
            setTimeout(() => {
                label = 'Copy IP';
            }, 3000);
        }
    }
</script>

<button class="connectButton" id={buttonId} onclick={copy}>{label}</button>
