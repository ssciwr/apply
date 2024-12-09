<svelte:options runes={true} />

<script lang="ts">
import UploadPdf from "$lib/components/UploadPdf.svelte";
import { preventDefault } from "$lib/util";
import DownloadOutline from "flowbite-svelte-icons/DownloadOutline.svelte";
import Button from "flowbite-svelte/Button.svelte";
import Checkbox from "flowbite-svelte/Checkbox.svelte";
import Heading from "flowbite-svelte/Heading.svelte";
import Input from "flowbite-svelte/Input.svelte";
import Label from "flowbite-svelte/Label.svelte";
import P from "flowbite-svelte/P.svelte";
import type { PDFPage } from "pdf-lib";
import { PDFDocument, rgb } from "pdf-lib";

let {
	position,
}: {
	position: string;
} = $props();

let name = $state("");

let pdfs = $state([
	{
		id: "cov",
		label: "Cover Letter",
		required: false,
		file: null as File | null,
	},
	{
		id: "cv",
		label: "CV",
		required: true,
		file: null as File | null,
	},
	{
		id: "cert",
		label: "Masters or PhD Certificate",
		required: true,
		file: null as File | null,
	},
]);

let checkboxes = $state([
	{ id: "Internal candidate", label: "Internal candidate", value: false },
	{ id: "Check2", label: "check box 2", value: false },
	{ id: "Check3", label: "check box 3", value: false },
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
	const yPadding = 40;
	page.drawText(text, { x: 50, y: page.getSize().height - yPos, size: 18 });
	return yPos + yPadding;
}

function writeHeader(page: PDFPage, text: string) {
	page.drawText(`${text} - ${position} - ${name}`, {
		x: 5,
		y: page.getSize().height - 12,
		size: 10,
		color: rgb(0.227, 0.62, 0.749),
	});
}

async function createPdfFrontPage() {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage();
	writeHeader(page, "Application");
	let yPos = 80;
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

async function addPdf(
	pdfDoc: PDFDocument,
	uploadedPdf: File | null,
	label: string,
) {
	if (!uploadedPdf) {
		return;
	}
	const buf = await uploadedPdf.arrayBuffer();
	const uploadedDoc = await PDFDocument.load(buf);
	for (const page of await pdfDoc.copyPages(
		uploadedDoc,
		uploadedDoc.getPageIndices(),
	)) {
		let newPage = pdfDoc.addPage(page);
		writeHeader(newPage, label);
	}
}

async function downloadMergedPdf() {
	if (!applicationComplete) {
		return;
	}
	let pdfDoc = await createPdfFrontPage();
	for (const pdf of pdfs) {
		await addPdf(pdfDoc, pdf.file, pdf.label);
	}
	const dataUri = await pdfDoc.saveAsBase64({ dataUri: true });
	const link = document.createElement("a");
	link.href = dataUri;
	link.download = `${position} - ${name}.pdf`;
	link.click();
}
</script>

		<div class="flex flex-col space-y-4 p-4">
			<Heading tag="h3">{position}</Heading>
			<P
			>To apply for this position, please fill in all required fields, then click "Download PDF"
				to download your application as PDF file and send it to abc@xyz.com</P
			>
			<form onsubmit={preventDefault(downloadMergedPdf)}>
			<div>
				<Label for="name">Name</Label>
				<Input bind:value={name} id="name"></Input>
			</div>
			{#each pdfs as pdf (pdf.id)}
				<UploadPdf bind:file={pdf.file} label={`${pdf.label} (pdf)`} id={pdf.id} />
			{/each}
			<P>Please check if any of the following apply to your application:</P>
			{#each checkboxes as checkbox (checkbox.id)}
				<Checkbox bind:checked={checkbox.value} class="mx-4">{checkbox.label}</Checkbox>
			{/each}
			<P>Once you have uploaded all required documents, please click "Download PDF" to download your application as a
				PDF
				file and then send it by email to abc@xyz.com</P>
			<Button type="submit" color="primary" on:click={downloadMergedPdf} disabled={!applicationComplete}>
				<DownloadOutline />
				Download PDF
			</Button>
			</form>
		</div>
