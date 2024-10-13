import FileUpload from '@/components/FileUpload';
import TranslationResult from '@/components/TranslationResult';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">YouTube Script Translator</h1>
      <FileUpload />
      <TranslationResult />
    </div>
  );
}