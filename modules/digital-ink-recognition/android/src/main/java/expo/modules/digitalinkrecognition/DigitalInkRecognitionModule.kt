// File: modules/digital-ink-recognition/android/src/main/java/expo/modules/digitalinkrecognition/DigitalInkRecognitionModule.kt

package expo.modules.digitalinkrecognition

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.types.Enumerable
import android.content.Context
import com.google.mlkit.vision.digitalink.DigitalInkRecognition
import com.google.mlkit.vision.digitalink.DigitalInkRecognitionModel
import com.google.mlkit.vision.digitalink.DigitalInkRecognitionModelIdentifier
import com.google.mlkit.vision.digitalink.DigitalInkRecognizer
import com.google.mlkit.vision.digitalink.DigitalInkRecognizerOptions
import com.google.mlkit.vision.digitalink.Ink
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.common.model.RemoteModelManager

class DigitalInkRecognitionModule : Module() {
    private var recognizer: DigitalInkRecognizer? = null
    private val modelManager = RemoteModelManager.getInstance()

    override fun definition() = ModuleDefinition {
        Name("DigitalInkRecognition")

        AsyncFunction("initializeRecognizer") { languageTag: String, promise: Promise ->
            try {
                val modelIdentifier = DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageTag)
                if (modelIdentifier == null) {
                    promise.reject("INVALID_LANGUAGE", "Invalid language tag: $languageTag", null)
                    return@AsyncFunction
                }

                val model = DigitalInkRecognitionModel.builder(modelIdentifier).build()
                recognizer = DigitalInkRecognition.getClient(
                    DigitalInkRecognizerOptions.builder(model).build()
                )
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("INIT_ERROR", "Failed to initialize recognizer", e)
            }
        }

        AsyncFunction("downloadModel") { languageTag: String, promise: Promise ->
            try {
                val modelIdentifier = DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageTag)
                if (modelIdentifier == null) {
                    promise.reject("INVALID_LANGUAGE", "Invalid language tag: $languageTag", null)
                    return@AsyncFunction
                }

                val model = DigitalInkRecognitionModel.builder(modelIdentifier).build()
                val conditions = DownloadConditions.Builder().build()
                
                modelManager.download(model, conditions)
                    .addOnSuccessListener {
                        promise.resolve(true)
                    }
                    .addOnFailureListener { e ->
                        promise.reject("DOWNLOAD_ERROR", "Failed to download model", e)
                    }
            } catch (e: Exception) {
                promise.reject("DOWNLOAD_ERROR", "Failed to download model", e)
            }
        }

        AsyncFunction("isModelDownloaded") { languageTag: String, promise: Promise ->
            try {
                val modelIdentifier = DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageTag)
                if (modelIdentifier == null) {
                    promise.reject("INVALID_LANGUAGE", "Invalid language tag: $languageTag", null)
                    return@AsyncFunction
                }

                val model = DigitalInkRecognitionModel.builder(modelIdentifier).build()
                modelManager.isModelDownloaded(model)
                    .addOnSuccessListener { isDownloaded ->
                        promise.resolve(isDownloaded)
                    }
                    .addOnFailureListener { e ->
                        promise.reject("CHECK_ERROR", "Failed to check model status", e)
                    }
            } catch (e: Exception) {
                promise.reject("CHECK_ERROR", "Failed to check model status", e)
            }
        }

        AsyncFunction("recognizeInk") { strokesData: List<Map<String, Any>>, promise: Promise ->
            val currentRecognizer = recognizer
            if (currentRecognizer == null) {
                promise.reject("NO_RECOGNIZER", "Recognizer not initialized", null)
                return@AsyncFunction
            }

            try {
                println("DigitalInkRecognition: Starting recognition with ${strokesData.size} strokes")
                val inkBuilder = Ink.builder()
                
                for ((strokeIndex, strokeData) in strokesData.withIndex()) {
                    val points = strokeData["points"] as? List<Map<String, Any>>
                    if (points != null) {
                        println("DigitalInkRecognition: Processing stroke $strokeIndex with ${points.size} points")
                        val strokeBuilder = Ink.Stroke.builder()
                        
                        for ((pointIndex, point) in points.withIndex()) {
                            val x = (point["x"] as? Number)?.toFloat() ?: 0f
                            val y = (point["y"] as? Number)?.toFloat() ?: 0f
                            val timestamp = (point["timestamp"] as? Number)?.toLong() ?: System.currentTimeMillis()
                            
                            strokeBuilder.addPoint(Ink.Point.create(x, y, timestamp))
                            if (pointIndex < 3 || pointIndex == points.size - 1) {
                                println("DigitalInkRecognition: Point $pointIndex: x=$x, y=$y, timestamp=$timestamp")
                            }
                        }
                        
                        inkBuilder.addStroke(strokeBuilder.build())
                    } else {
                        println("DigitalInkRecognition: Warning: stroke $strokeIndex has no points")
                    }
                }

                val ink = inkBuilder.build()
                println("DigitalInkRecognition: Built ink with ${ink.strokes.size} strokes")
                
                currentRecognizer.recognize(ink)
                    .addOnSuccessListener { result ->
                        println("DigitalInkRecognition: Recognition successful, got ${result.candidates.size} candidates")
                        val candidates = result.candidates.map { candidate ->
                            println("DigitalInkRecognition: Candidate: '${candidate.text}' with score ${candidate.score}")
                            mapOf(
                                "text" to candidate.text,
                                "score" to candidate.score
                            )
                        }
                        println("DigitalInkRecognition: Returning ${candidates.size} candidates")
                        promise.resolve(candidates)
                    }
                    .addOnFailureListener { e ->
                        println("DigitalInkRecognition: Recognition failed: ${e.message}")
                        promise.reject("RECOGNITION_ERROR", "Failed to recognize ink", e)
                    }
            } catch (e: Exception) {
                println("DigitalInkRecognition: Exception during recognition: ${e.message}")
                promise.reject("RECOGNITION_ERROR", "Failed to recognize ink", e)
            }
        }

        AsyncFunction("deleteModel") { languageTag: String, promise: Promise ->
            try {
                val modelIdentifier = DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageTag)
                if (modelIdentifier == null) {
                    promise.reject("INVALID_LANGUAGE", "Invalid language tag: $languageTag", null)
                    return@AsyncFunction
                }

                val model = DigitalInkRecognitionModel.builder(modelIdentifier).build()
                modelManager.deleteDownloadedModel(model)
                    .addOnSuccessListener {
                        promise.resolve(true)
                    }
                    .addOnFailureListener { e ->
                        promise.reject("DELETE_ERROR", "Failed to delete model", e)
                    }
            } catch (e: Exception) {
                promise.reject("DELETE_ERROR", "Failed to delete model", e)
            }
        }
    }
}



