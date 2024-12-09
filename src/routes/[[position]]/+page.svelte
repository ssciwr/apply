<svelte:options runes={true} />

<script lang="ts">
import { page } from "$app/stores";
import UploadPdf from "$lib/components/UploadPdf.svelte";
import DownloadOutline from "flowbite-svelte-icons/DownloadOutline.svelte";
import Button from "flowbite-svelte/Button.svelte";
import Checkbox from "flowbite-svelte/Checkbox.svelte";
import Heading from "flowbite-svelte/Heading.svelte";
import Input from "flowbite-svelte/Input.svelte";
import Label from "flowbite-svelte/Label.svelte";
import P from "flowbite-svelte/P.svelte";
import type { PDFPage } from "pdf-lib";
import { PDFDocument } from "pdf-lib";

let name = $state("");

let openPositions = $state({
	rse: "SSC Research Software Engineer",
	web: "SSC Research Software Engineer - Web Development",
	hpc: "SSC Research Software Engineer - HPC",
} as Record<string, string>);
let position = openPositions[$page.params.position] ?? "";

let pdfs = $state([
	{
		id: "CoverLetter",
		text: "Cover Letter (pdf)",
		required: false,
		file: null as File | null,
	},
	{
		id: "CV",
		text: "CV (pdf, required)",
		required: true,
		file: null as File | null,
	},
	{
		id: "MastersCertificate",
		text: "Masters or PhD Certificate (pdf, required)",
		required: true,
		file: null as File | null,
	},
]);

let checkboxes = $state([
	{ id: "Internal candidate", text: "Internal candidate", value: false },
	{ id: "Check2", text: "check box 2", value: false },
	{ id: "Check3", text: "check box 3", value: false },
]);

let applicationComplete = $derived.by(() => {
	for (const pdf of pdfs) {
		if (pdf.required && !pdf.file) {
			return false;
		}
	}
	return true;
});

function writeLine(page: PDFPage, text: string, yPos: number): number {
	page.drawText(text, { x: 50, y: page.getSize().height - yPos });
	return yPos + 50;
}

async function createPdfFrontPage() {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage();
	let yPos = 100;
	yPos = writeLine(page, "SSC Application", yPos);
	yPos = writeLine(page, `Position: ${position}`, yPos);
	yPos = writeLine(page, `Name: ${name}`, yPos);
	for (const checkbox of checkboxes) {
		yPos = writeLine(
			page,
			`${checkbox.id}: ${checkbox.value ? "YES" : "NO"}`,
			yPos,
		);
	}
	return pdfDoc;
}

async function addPdf(pdfDoc: PDFDocument, uploadedPdf: File | null) {
	if (!uploadedPdf) {
		return;
	}
	const buf = await uploadedPdf.arrayBuffer();
	const uploadedDoc = await PDFDocument.load(buf);
	for (const page of await pdfDoc.copyPages(
		uploadedDoc,
		uploadedDoc.getPageIndices(),
	)) {
		pdfDoc.addPage(page);
	}
}

async function downloadMergedPdf() {
	if (!applicationComplete) {
		return;
	}
	let pdfDoc = await createPdfFrontPage();
	for (const pdf of pdfs) {
		await addPdf(pdfDoc, pdf.file);
	}
	const dataUri = await pdfDoc.saveAsBase64({ dataUri: true });
	const link = document.createElement("a");
	link.href = dataUri;
	link.download = `${position} - ${name}.pdf`;
	link.click();
}
</script>

<div class="flex flex-col container max-w-2xl md:mx-auto p-2">
	<Heading class="my-2 p-4 text-center text-red-500">WORK IN PROGRESSS!</Heading>
	{#if position}
		<div class="flex flex-col space-y-4 p-4">
			<Heading tag="h3">{position}</Heading>
			<P
			>To apply for this position, please fill in all required fields, then click "Download PDF"
				to download your application as PDF file and send it to abc@xyz.com</P
			>
			<div>
				<Label>Name</Label>
				<Input bind:value={name}></Input>
			</div>
			{#each pdfs as pdf (pdf.id)}
				<UploadPdf bind:file={pdf.file} label={pdf.text} />
			{/each}
			<P>Please check if any of the following apply to your application:</P>
			{#each checkboxes as checkbox (checkbox.id)}
				<Checkbox bind:checked={checkbox.value} class="mx-4">{checkbox.text}</Checkbox>
			{/each}
			<P>Once you have uploaded all required documents, please click "Download PDF" to download your application as a
				PDF
				file and then send it by email to abc@xyz.com</P>
			<Button color="primary" on:click={downloadMergedPdf} disabled={!applicationComplete}>
				<DownloadOutline />
				Download PDF
			</Button>
		</div>
	{:else}
		<div class="flex flex-col space-y-4 p-4">
			<Heading tag="h3">Invalid or expired link.</Heading>
		</div>
	{/if}
</div>
