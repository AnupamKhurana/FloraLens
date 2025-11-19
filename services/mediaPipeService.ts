import { ImageClassifier, FilesetResolver } from '@mediapipe/tasks-vision';

let imageClassifier: ImageClassifier | null = null;

// Initialize the MediaPipe Image Classifier
export const initMediaPipe = async () => {
  if (imageClassifier) return;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    
    imageClassifier = await ImageClassifier.createFromOptions(vision, {
      baseOptions: {
        // Using EfficientNet-Lite0, a lightweight model suitable for browsers
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.tflite"
      },
      maxResults: 3, // Get top 3 to improve chances of catching the plant name
    });
    console.log("MediaPipe Image Classifier loaded");
  } catch (error) {
    console.error("Failed to load MediaPipe:", error);
  }
};

export const classifyImageOffline = (imageElement: HTMLImageElement): string[] => {
  if (!imageClassifier) {
    throw new Error("Offline recognition model not loaded yet");
  }

  const result = imageClassifier.classify(imageElement);
  
  if (result.classifications.length > 0 && result.classifications[0].categories.length > 0) {
    // Return the array of detected category names
    return result.classifications[0].categories.map(c => c.categoryName);
  }
  
  return [];
};