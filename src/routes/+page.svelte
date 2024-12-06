<svelte:options runes={true}/>

<script lang="ts">
	import Button from 'flowbite-svelte/Button.svelte';
	import Card from 'flowbite-svelte/Card.svelte';
	import Input from 'flowbite-svelte/Input.svelte';
	import Label from 'flowbite-svelte/Label.svelte';
	import Heading from 'flowbite-svelte/Heading.svelte';
	import P from 'flowbite-svelte/P.svelte';
	import Checkbox from 'flowbite-svelte/Checkbox.svelte';
	import DownloadOutline from 'flowbite-svelte-icons/DownloadOutline.svelte';
	import { PDFDocument, PDFPage } from 'pdf-lib'
	import PDFMerger from 'pdf-merger-js/browser';
	import UploadPdf from '$lib/components/UploadPdf.svelte';

	let position = $state("RSE")
	let name = $state("");
	let pdfCoverLetter = $state(null as File | null);
	let pdfCV = $state(null as File | null);
	let pdfMastersCertificate = $state(null as File | null);
	let applicationComplete = true; //$derived(pdfCoverLetter && pdfCV && pdfMastersCertificate);

	let checkboxes = $state([{id: "Internal candidate", "text": "Internal candidate", value: false}, {id: "Check2", "text": "check box 2", value: false}]);

	function writeLine(page: PDFPage, text: string, ypos: number): number {
		page.drawText(text, {x:50, y: page.getSize().height - ypos})
		return ypos + 50
	}

	async function createPdfFrontPage(){
		const pdfDoc = await PDFDocument.create()
		const page = pdfDoc.addPage()
		let ypos = 100
		ypos = writeLine(page, `Application for SSC Position: ${position}`, ypos)
		ypos = writeLine(page, `Name: ${name}`, ypos)
		for(const checkbox of checkboxes){
			ypos = writeLine(page, `${checkbox.id}: ${checkbox.value ? 'YES' : 'NO'}`, ypos)
		}
		return pdfDoc.save()
	}

	async function downloadMergedPdf(){
		if(!applicationComplete){
			return;
		}
		const merger = new PDFMerger();
		await merger.add(await createPdfFrontPage())
		// await merger.add(pdfCoverLetter)
		// await merger.add(pdfCV)
		// await merger.add(pdfMastersCertificate)
		await merger.save("application")
	}
</script>

<div class="flex flex-col md:container md:mx-auto">
	<Heading class="my-2 p-4 text-center">WORK IN PROGRESSS!</Heading>
	<Card size="2xl" class="my-2">
		<div class="flex flex-col space-y-4">
			<P>To apply for this position, please fill in all required fields, then click "Download PDF" to download your application as PDF file and send it to abc@xyz.com</P>
			<div>
			<Label>Name</Label>
			<Input bind:value={name}></Input>
			</div>
		<UploadPdf bind:file={pdfCoverLetter} label="Cover Letter (pdf)" />
		<UploadPdf bind:file={pdfCV} label="CV (pdf)" />
		<UploadPdf bind:file={pdfMastersCertificate} label="Masters or PhD Certificate (pdf)" />
			<P>
				Please check if any of the following apply to your application:
			</P>
			{#each checkboxes as checkbox (checkbox.id)}
				<Checkbox bind:checked={checkbox.value}>{checkbox.text}</Checkbox>
				{/each}
		</div>
	</Card>
	<Button color="primary" class="m-4" on:click={downloadMergedPdf} disabled={!applicationComplete}>
		<DownloadOutline />
		Download PDF
	</Button>
</div>
