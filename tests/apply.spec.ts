import { expect, test } from "@playwright/test";
import type { Download } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

async function makePDFUpload(filename: string, numPages: number) {
	const pdfDoc = await PDFDocument.create();
	for (let i = 0; i < numPages; i++) {
		pdfDoc.addPage();
	}
	const pdfBytes = await pdfDoc.save();
	return {
		name: filename,
		mimeType: "application/pdf",
		buffer: Buffer.from(pdfBytes),
	};
}

async function getDownloadAsPdf(download: Download): Promise<PDFDocument> {
	const stream = await download.createReadStream();
	const buffers = [] as Array<Buffer>;
	for await (const data of stream) {
		buffers.push(data);
	}
	const buffer = Buffer.concat(buffers);
	return await PDFDocument.load(buffer);
}

test("rse", async ({ page }) => {
	await page.goto("/rse");
	await expect(page.getByRole("button", { name: /download/i })).toBeDisabled();

	// fill in form
	await page.getByLabel("Name").fill("Joe Bloggs");
	await page.getByRole("checkbox", { name: /internal/i }).click();
	await page
		.getByLabel(/cover letter/i)
		.setInputFiles(await makePDFUpload("letter.pdf", 1));
	await expect(
		page.getByRole("button", { name: /download pdf/i }),
	).toBeDisabled();
	await page.getByLabel(/cv/i).setInputFiles(await makePDFUpload("cv.pdf", 3));
	await expect(
		page.getByRole("button", { name: /download pdf/i }),
	).toBeDisabled();
	await page
		.getByLabel(/cert/i)
		.setInputFiles(await makePDFUpload("cert.pdf", 1));
	await expect(
		page.getByRole("button", { name: /download pdf/i }),
	).toBeEnabled();

	// download pdf
	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("button", { name: /download pdf/i }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toContain("Joe Bloggs");
	const pdfDoc = await getDownloadAsPdf(download);
	expect(pdfDoc.getPageCount()).toEqual(6);
});
