<script lang="ts">
  import '../app.css';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="grid h-screen grid-rows-[auto_1fr]">
  {@render children?.()}
</div>
