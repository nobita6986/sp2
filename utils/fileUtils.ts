

export const fileToFullResDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as a data URL.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const resizeImageToDataUrl = (file: File, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                if (img.width <= maxWidth) {
                    resolve(img.src); // No need to resize if it's already small enough
                    return;
                }
                const canvas = document.createElement('canvas');
                const scaleFactor = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scaleFactor;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL(file.type || 'image/jpeg'));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};


export const dataUrlToPureBase64 = (dataUrl: string): string => {
    // The result is a data URL: "data:image/jpeg;base64,LzlqLzRBQ...". We need to strip the prefix.
    return dataUrl.split(',')[1];
};


export const downloadTextFile = (content: string, filename: string) => {
  const element = document.createElement("a");
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
};