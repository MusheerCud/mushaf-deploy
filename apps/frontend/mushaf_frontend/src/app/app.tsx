import { useState } from 'react';
import { UploadPage } from './UploadPage';
import { ViewPage } from './ViewPage';

export function App() {
  const [viewingPageNumber, setViewingPageNumber] = useState<number | null>(null);

  return (
    <div className="app-container">
      {viewingPageNumber === null ? (
        <UploadPage onPageSelected={setViewingPageNumber} />
      ) : (
        <ViewPage 
          pageNumber={viewingPageNumber} 
          onBack={() => setViewingPageNumber(null)} 
        />
      )}
    </div>
  );
}

export default App;
