// src/pages/Home.tsx

import Container from "../components/container";
import { FileUploader } from "../components/file-uploader";
import { WelcomeModal } from "../components/welcome-modal";

/**
 * Página principal – Analizador de Datos Químicos
 */
export function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <Container>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="mb-6 text-center text-2xl font-bold sm:mb-8 sm:text-3xl">
            Analizador de Datos Químicos
          </h1>

          <section
            id="file-upload-section"
            className="rounded-lg bg-white p-4 shadow-md sm:p-6"
          >
            <FileUploader />
          </section>
        </div>
      </Container>

      <WelcomeModal />
    </main>
  );
}