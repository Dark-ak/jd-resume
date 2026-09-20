import JdComponent from "@/components/Left/JdComponent";
import PdfComponent from "@/components/Right/PdfComponent";

export default function Home() {
  return (
    <div>
      <main className="grid lg:grid-cols-5 overflow-hidden">
        <JdComponent />
        <PdfComponent />
      </main>
    </div>
  );
}
