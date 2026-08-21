export const compressImage = async (file: File, maxSizeMB: number = 1): Promise<File> => {
  // Si le fichier est déjà petit, pas besoin de compression
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculer les nouvelles dimensions (max 1920px)
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en blob avec compression progressive
        let quality = 0.9;
        const attemptCompression = (currentQuality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }

              // Si le fichier est toujours trop gros et qu'on peut encore réduire la qualité
              if (blob.size > maxSizeMB * 1024 * 1024 && currentQuality > 0.5) {
                attemptCompression(currentQuality - 0.1);
              } else {
                // Créer un nouveau fichier avec le blob compressé
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            currentQuality
          );
        };

        attemptCompression(quality);
      };

      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
};
