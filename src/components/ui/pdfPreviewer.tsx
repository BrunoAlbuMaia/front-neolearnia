// src/components/PdfPreviewer.tsx

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "./button";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { Checkbox } from "./checkbox";
import { Loader2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewerProps {
  file: File;
  onConfirm: (selectedPages: number[]) => void;
  onCancel: () => void;
}

export default function PdfPreviewer({ file, onConfirm, onCancel }: PdfPreviewerProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pagesLoading, setPagesLoading] = useState(true);

  const [activePage, setActivePage] = useState(1);
  const [selectedPages, setSelectedPages] = useState(new Set<number>());

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPages, setFilteredPages] = useState<number[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const thumbnailCanvasRefs = useRef(new Map<number, HTMLCanvasElement>());
  const activeThumbnailRef = useRef<HTMLDivElement | null>(null);

  const mainViewRef = useRef<HTMLDivElement | null>(null);

  const renderPage = useCallback(async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number, canvas: HTMLCanvasElement | null, scale: number) => {
    if (!canvas) return;
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      if (context) {
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport }).promise;
      }
    } catch (e) {
      console.error(`Erro ao renderizar a página ${pageNumber}:`, e);
    }
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setPagesLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      } catch (error) {
        console.error("Erro ao carregar PDF:", error);
        onCancel();
      }
    };
    loadPdf();
  }, [file, onCancel]);

  useEffect(() => {
    if (!pdfDoc) return;
    const renderAllThumbnails = async () => {
      const promises = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const canvas = thumbnailCanvasRefs.current.get(i);
        promises.push(renderPage(pdfDoc, i, canvas || null, 0.4));
      }
      await Promise.all(promises);
      setPagesLoading(false);
    };
    renderAllThumbnails();
  }, [pdfDoc, renderPage]);

  useLayoutEffect(() => {
    const renderMainPage = async () => {
      if (pdfDoc && mainCanvasRef.current && mainViewRef.current) {
        const containerWidth = mainViewRef.current.offsetWidth;
        const page = await pdfDoc.getPage(activePage);
        const viewport = page.getViewport({ scale: 1 });

        const scale = (containerWidth / viewport.width) * 0.95;
        const scaledViewport = page.getViewport({ scale });

        const canvas = mainCanvasRef.current;
        const context = canvas.getContext("2d");
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        if (context) {
          context.fillStyle = "white";
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
        }

        activeThumbnailRef.current?.scrollIntoView({ block: "nearest" });
      }
    };

    renderMainPage();
    window.addEventListener("resize", renderMainPage);
    return () => window.removeEventListener("resize", renderMainPage);
  }, [pdfDoc, activePage]);

  const goToNextPage = useCallback(() => {
    setActivePage((current) => (current < numPages ? current + 1 : current));
  }, [numPages]);

  const goToPrevPage = useCallback(() => {
    setActivePage((current) => (current > 1 ? current - 1 : current));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNextPage();
      else if (e.key === "ArrowLeft") goToPrevPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextPage, goToPrevPage]);

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!pdfDoc || !query) {
      setFilteredPages(null);
      return;
    }
    const pageNumberQuery = parseInt(query, 10);
    if (!isNaN(pageNumberQuery) && pageNumberQuery > 0 && pageNumberQuery <= pdfDoc.numPages) {
      setActivePage(pageNumberQuery);
      setFilteredPages(null);
      return;
    }
    setIsSearching(true);
    const lowerCaseQuery = query.toLowerCase();
    const foundPages: number[] = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => ("str" in item ? item.str : "")).join(" ").toLowerCase();
      if (pageText.includes(lowerCaseQuery)) foundPages.push(i);
    }
    setFilteredPages(foundPages);
    setIsSearching(false);
  }, [pdfDoc, searchQuery]);

  const handlePageSelect = (pageNumber: number) => {
    const newSelected = new Set(selectedPages);
    newSelected.has(pageNumber) ? newSelected.delete(pageNumber) : newSelected.add(pageNumber);
    setSelectedPages(newSelected);
  };

  const pagesToDisplay = filteredPages === null ? Array.from({ length: numPages }, (_, i) => i + 1) : filteredPages;

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Cabeçalho */}
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Visualizador de PDF</h2>
          <p className="text-sm text-muted-foreground">Use as setas para navegar ou clique nas miniaturas.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por texto ou nº da página..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
          {isSearching && <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => {
                setSearchQuery("");
                setFilteredPages(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo Responsivo */}
      <div className="flex-1 flex flex-col md:flex-row overflow-auto">
        {/* Miniaturas */}
        <ScrollArea className="md:w-52 w-full md:h-full border-r bg-muted/30">
          <div className="p-2 grid grid-cols-3 md:grid-cols-1 gap-2">
            {pagesLoading && (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
              <div
                key={pageNumber}
                ref={pageNumber === activePage ? activeThumbnailRef : null}
                className={cn("relative group", !pagesToDisplay.includes(pageNumber) && "hidden")}
              >
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    id={`page-${pageNumber}`}
                    checked={selectedPages.has(pageNumber)}
                    onCheckedChange={() => handlePageSelect(pageNumber)}
                    className="bg-background shadow-md"
                  />
                </div>
                <label htmlFor={`page-${pageNumber}`} onClick={() => setActivePage(pageNumber)}>
                  <canvas
                    ref={(el) => {
                      if (el) thumbnailCanvasRefs.current.set(pageNumber, el);
                    }}
                    className={cn(
                      "w-full rounded-md border-2 transition-all cursor-pointer",
                      activePage === pageNumber ? "border-primary" : "border-transparent hover:border-border"
                    )}
                  />
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Visualização Principal */}
        <div className="flex-1 h-full relative group" ref={mainViewRef}>
          <ScrollArea className="h-full bg-secondary/20 p-2 sm:p-4">
            <div className="flex justify-center">
              <canvas ref={mainCanvasRef} className="shadow-lg rounded-md max-w-full h-auto" />
            </div>
          </ScrollArea>
          <Button
            variant="secondary"
            size="icon"
            onClick={goToPrevPage}
            disabled={activePage === 1}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={goToNextPage}
            disabled={activePage === numPages}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* Rodapé */}
      <div className="p-4 border-t flex justify-between items-center bg-card">
        <p className="text-sm font-medium">{selectedPages.size} de {numPages} páginas selecionadas</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button
            onClick={() => onConfirm(Array.from(selectedPages).sort((a, b) => a - b))}
            disabled={selectedPages.size === 0}
          >
            Importar {selectedPages.size > 0 ? selectedPages.size : ""} Páginas
          </Button>
        </div>
      </div>
    </div>
  );
}
