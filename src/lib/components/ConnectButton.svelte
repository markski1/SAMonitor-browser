<script lang="ts">
    interface Props {
        ip: string;
    }

    let { ip }: Props = $props();
</script>

<a href={`samp://${ip}`}><button>Connect</button></a>
