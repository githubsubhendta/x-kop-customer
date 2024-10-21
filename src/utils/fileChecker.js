export const getMessageTypeFromFile = (fileName) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'ogg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'webm'];
    
    const fileExtension = fileName.split('.').pop().toLowerCase();
  
    if (imageExtensions.includes(fileExtension)) {
      return 'image';
    } else if (audioExtensions.includes(fileExtension)) {
      return 'audio';
    } else if (videoExtensions.includes(fileExtension)) {
      return 'video';
    } else {
      return 'file'; 
    }
  };

  export const getFileExtension = (fileName) => {
    const fileExtension = fileName.split('.').pop().toLowerCase();
     return fileExtension;
  };