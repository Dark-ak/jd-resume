'use client'

import { useFileStore } from "@/store/fileStore"
import LoadPdf from "@/utils/LoadPdf"
import { useEffect, useRef } from "react"

export default function PdfComponent(){

  const {file} = useFileStore()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)


  useEffect(() => {
    if(!file) return

    LoadPdf(canvasRef, file[0])
    
  }, [file])

  
  return (
    <div className="h-fit bg-secondary lg:h-screen p-4 col-span-3 overflow-y-scroll">
      <div className="flex justify-center">
        <div className="border">
          <canvas ref={canvasRef} className="w-175" />
          
        </div>
      </div>
    </div>
  )
}
