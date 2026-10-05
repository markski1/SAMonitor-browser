<script lang="ts">
    interface Props {
        ip: string;
    }

    let { ip }: Props = $props();
</script>

<a class="button-link primary-button" href={`samp://${ip}`}>Connect</a>
