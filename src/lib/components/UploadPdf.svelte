<svelte:options runes={true} />

<script lang="ts">
import { Fileupload, Label } from "flowbite-svelte";

let {
	file = $bindable(null as File | null),
	label,
	id,
}: {
	file: File | null;
	label: string;
	id: string;
} = $props();

let files: FileList | undefined = $state(undefined);

function updateFile(event: Event) {
	const target = event.target as HTMLInputElement;
	if (target.files) {
		file = target.files[0];
	} else {
		file = null;
	}
}
</script>

<div class="flex flex-col">
	<Label for={id}>{label}</Label>
	<Fileupload {id} bind:files accept=".pdf" multiple={false} on:change={updateFile} required />
</div>
