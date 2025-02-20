"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import { Loader2Icon, RotateCw, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// We need to configure CORS
// gsutil cors set cors.json gs://<app-name>.appspot.com
// gsutil cors set cors.json gs://chat-with-pdf-challenge.appspot.com
// go here >>> https://console.cloud.google.com/
// create new file in editor calls cors.json
// run >>> // gsutil cors set cors.json gs://chat-with-pdf-challenge.appspot.com
// https://firebase.google.com/docs/storage/web/download-files#cors_configuration

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfView({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [file, setFile] = useState<Blob | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const fetchFile = async () => {
      const response = await fetch(url);
      const file = await response.blob();

      setFile(file);
    };

    fetchFile();
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="sticky top-0 z-50 bg-purple-50 p-2 dark:bg-slate-600">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-1 overflow-x-auto px-2 text-[12px] sm:scale-90 sm:gap-x-2 sm:text-base md:scale-100">
          <Button
            variant="outline"
            className="min-w-fit"
            disabled={pageNumber === 1}
            onClick={() => pageNumber > 1 && setPageNumber(pageNumber - 1)}
          >
            Previous
          </Button>

          <p className="flex items-center justify-center">
            {pageNumber} of {numPages}
          </p>

          <Button
            variant="outline"
            disabled={pageNumber === numPages}
            onClick={() =>
              numPages && pageNumber < numPages && setPageNumber(pageNumber + 1)
            }
          >
            Next
          </Button>

          <Button
            variant="outline"
            onClick={() => setRotation((rotation + 90) % 360)}
          >
            <RotateCw />
          </Button>

          <Button
            variant="outline"
            disabled={scale >= 1.5}
            onClick={() => setScale(scale * 1.2)}
          >
            <ZoomInIcon />
          </Button>

          <Button
            variant="outline"
            disabled={scale <= 0.65}
            onClick={() => setScale(scale / 1.2)}
          >
            <ZoomOutIcon />
          </Button>
        </div>
      </div>

      {!file ? (
        <Loader2Icon className="mt-20 h-20 w-20 animate-spin text-indigo-600" />
      ) : (
        <Document
          loading={null}
          file={file}
          rotate={rotation}
          onLoadSuccess={onDocumentLoadSuccess}
          className="m-4 overflow-scroll"
        >
          <Page className="shadow-lg" scale={scale} pageNumber={pageNumber} />
        </Document>
      )}
    </div>
  );
}
export default PdfView;
